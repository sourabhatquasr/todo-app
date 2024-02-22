import { Component, EventEmitter, Output } from '@angular/core';
import { Todo } from '../model';
import { TodoService } from '../todo.service';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskComponent } from '../edit-task/edit-task.component';

@Component({
  selector: 'app-view-tasks',
  templateUrl: './view-tasks.component.html',
  styleUrls: ['./view-tasks.component.css']
})
export class ViewTasksComponent {
  @Output()
  editTasksEvent: EventEmitter<void> = new EventEmitter<void>();
  
  todos: Todo[] = []
  
  constructor(private service: TodoService, public dialog:MatDialog) {
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

  editTask(todo: Todo){
    const dialogRef = this.dialog.open(EditTaskComponent, {data: todo});
    dialogRef.afterClosed().subscribe(result => {
      this.updateView();
      // console.log("Updated")
    });
  }

  updateView(){
    this.todos = this.service.getTodos();
  }
}
