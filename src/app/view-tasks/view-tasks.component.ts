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
  
  toggleStatus(todo: Todo): void {
    this.service.toggleCompletion(todo);
    this.updateView();
  }
  
  deleteTodo(todo: Todo): void {
    this.service.deleteTodo(todo.id);
    this.updateView();
  }

  updateView(){
    this.todos = this.service.getTodos();
  }
}
