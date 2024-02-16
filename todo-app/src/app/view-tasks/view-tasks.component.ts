import { Component } from '@angular/core';
import { Todo } from '../model';
import { TodoService } from '../todo.service';

@Component({
  selector: 'app-view-tasks',
  templateUrl: './view-tasks.component.html',
  styleUrls: ['./view-tasks.component.css']
})
export class ViewTasksComponent {
  
  todos: Todo[] = []
  
  constructor(private service: TodoService) {
    this.todos = this.service.getTodos(); 
  }

  deleteTodo(id: number): void {
    this.service.deleteTodo(id);
    this.todos = this.service.getTodos();
  }
  
  toggleStatus(todo: Todo): void {
    this.service.toggleCompletion(todo);
    this.todos = this.service.getTodos();
  }
}
