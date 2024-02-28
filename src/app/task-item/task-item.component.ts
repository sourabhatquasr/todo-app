import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Todo } from '../model';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.css']
})
export class TaskItemComponent {
  @Input() todo: any;

  @Output() toggleStatus: EventEmitter<Todo> = new EventEmitter<Todo>();
  @Output() editTask: EventEmitter<Todo> = new EventEmitter<Todo>();
  @Output() deleteTask: EventEmitter<Todo> = new EventEmitter<Todo>();


  constructor() {
  }

  editItem(todo: Todo){
    this.editTask.emit(todo);
  }

  toggleItem(todo: Todo){
    this.toggleStatus.emit(todo);
  }

  deleteItem(todo: Todo){
    this.deleteTask.emit(todo);
  }
}
