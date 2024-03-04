import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Todo } from '../model';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.css']
})
export class TaskItemComponent {
[x: string]: any;
  @Input() todo: any;

  @Output() markAsCompleted: EventEmitter<Todo> = new EventEmitter<Todo>();
  @Output() markAsInProgress: EventEmitter<Todo> = new EventEmitter<Todo>();
  @Output() markAsIncomplete: EventEmitter<Todo> = new EventEmitter<Todo>();
  @Output() editTask: EventEmitter<Todo> = new EventEmitter<Todo>();
  @Output() deleteTask: EventEmitter<Todo> = new EventEmitter<Todo>();

  today: Date = new Date();

  constructor() {
  }

  editItem(todo: Todo){
    this.editTask.emit(todo);
  }

  completeTask(todo: Todo){
    this.markAsCompleted.emit(todo);
  }

  redoTask(todo: Todo){
    this.markAsIncomplete.emit(todo);
  }

  workOnTask(todo: Todo){
    this.markAsInProgress.emit(todo);
  }

  deleteItem(todo: Todo){
    this.deleteTask.emit(todo);
  }
}
