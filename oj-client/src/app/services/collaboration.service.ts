import { Injectable } from '@angular/core';
import { COLORS } from '../../assets/colors';

declare var io: any;
declare var ace: any;

@Injectable()
export class CollaborationService {

  collaborationSocket: any;
  clientsInfo: Object = {};
  clientNum: number = 0;

  constructor() { }

  init(editor: any, sessionId: string): void {
    // 发送handshake，与server建立连接，并把session id传过去
    this.collaborationSocket = io(window.location.origin, { query: 'sessionId=' + sessionId });

    // 监听server上传过来的change事件
    // monitor "cursorMove" event from server
    this.collaborationSocket.on("change", (delta: string) => {
      console.log('collaboration: editor changes by ' + delta);
      delta = JSON.parse(delta);
      editor.lastAppliedChange = delta;
      editor.getSession().getDocument().applyDeltas([delta]);
    });


    // 监听server上传过来的cursorMove事件
    // monitor "cursorMove" event from server
    this.collaborationSocket.on("cursorMove", (cursor) => {
      console.log("cursor move: " + cursor);
      let session = editor.getSession();
      cursor = JSON.parse(cursor);
      let x = cursor['row'];
      let y = cursor['column'];
      // whose cursor has moved
      let changeClientId = cursor['socketId'];
      console.log(x + ' ' + y + ' ' + changeClientId);

      if (changeClientId in this.clientsInfo) {
        // delete old cursor
        session.removeMarker(this.clientsInfo[changeClientId]['marker']);
      } else {
        this.clientsInfo[changeClientId] = {};

        let css = document.createElement("style");
        css.type = "text/css";

        css.innerHTML = ".editor_cursor_" + changeClientId
          + " { position:absolute; background:" + COLORS[this.clientNum] + ";"
          + " z-index: 100; width:3px !important; }";

        document.body.appendChild(css);
        this.clientNum++;
      }

      // create new cursor
      let Range = ace.require('ace/range').Range;
      let newMarker = session.addMarker(new Range(x, y, x, y + 1), 'editor_cursor_' + changeClientId, true);
      this.clientsInfo[changeClientId]['marker'] = newMarker;
    });

    // Test
    this.collaborationSocket.on("message", (message) => {
      console.log("received: " + message);
    })
  }

  // client端向server端发送change event
  change(delta: string): void {
    this.collaborationSocket.emit("change", delta);
  }

  // client端向server端发送cursorMove event
  cursorMove(cursor : string): void {
    this.collaborationSocket.emit("cursorMove", cursor);
  }

  // client端告诉server端，需要change list来同步到已经编辑的代码
  restoreBuffer(): void {
    this.collaborationSocket.emit("restoreBuffer");
  }
}
