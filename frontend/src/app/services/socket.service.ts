import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private readonly SERVER_URL = 'http://localhost:5000';

  // ReplaySubject(1) replays the last emission to any late subscriber,
  // eliminating the race condition where events fired before subscriptions
  // were set up.
  taskCreated$ = new ReplaySubject<any>(1);
  taskUpdated$ = new ReplaySubject<any>(1);
  taskDeleted$ = new ReplaySubject<{ _id: string }>(1);

  /**
   * Connects to the server. Safe to call multiple times — idempotent.
   * Guards against both "already connected" and "currently connecting"
   * states to prevent duplicate socket instances and stacked listeners.
   */
  connect(): void {
    // socket.io sets connected=false while handshaking, so we check for
    // the socket object's existence, not just the connected boolean.
    if (this.socket) return;

    this.socket = io(this.SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
    });

    this.socket.on('taskCreated', (task: any) => {
      this.taskCreated$.next(task);
    });

    this.socket.on('taskUpdated', (task: any) => {
      this.taskUpdated$.next(task);
    });

    this.socket.on('taskDeleted', (data: { _id: string }) => {
      this.taskDeleted$.next(data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  }

  /**
   * Fully tears down the socket. Only call this when the application
   * itself is shutting down (ngOnDestroy of the root service).
   * Do NOT call this in page-level component ngOnDestroy — the service
   * is a singleton and the socket is shared across all components.
   */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
