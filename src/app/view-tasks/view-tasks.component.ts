import { Component } from '@angular/core';
import { TaskStatus, Todo } from '../model';
import { TodoService } from '../todo.service';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskComponent } from '../edit-task/edit-task.component';
import { ConfimrationDialogComponent } from '../confimration-dialog/confimration-dialog.component';
import { ToastService, ToastType } from '../toast.service';

@Component({
  selector: 'app-view-tasks',
  templateUrl: './view-tasks.component.html',
  styleUrls: ['./view-tasks.component.css'],

})
export class ViewTasksComponent {

  incompleteTasks: Todo[] = [];
  unsortedCompletedTasks: Todo[] = [];
  ongoingTasks: Todo[] = [];
  completedTasks: Todo[] = []; 
  overdueTasks: Todo[] = [];
  showOverdueTasks: boolean = false;
  
  constructor(private service: TodoService, public dialog: MatDialog, private toast: ToastService) {
    this.incompleteTasks = this.service.getTodos().filter(todo => todo.status === ( TaskStatus.InProgress || TaskStatus.Completed));
    this.updateView();
    this.filterOverdueTasks();
  }
  
  showOverdueTodos(){
    this.showOverdueTasks = !this.showOverdueTasks;
  }

  filterOverdueTasks() {
    const currentDate = new Date();
    this.overdueTasks = this.incompleteTasks.filter(task => {
      return task.dueDate && new Date(task.dueDate) < currentDate && currentDate && task.status === TaskStatus.Todo;
    });
  }

  markAsCompleted(todo: Todo){
    todo.status = TaskStatus.Completed;
    todo.completedDate = new Date();
    this.service.updateTodo(todo);
    this.toast.showToast(`'${todo.title}' is marked as completed`, ToastType.Success);
    this.updateView();
  }
  
  markTaskInProgress(todo: Todo){
    this.service.updateTodo(todo);
    todo.status = TaskStatus.InProgress;
    delete todo.completedDate;
    this.toast.showToast(`'${todo.title}'  is in progress`, ToastType.Success);
    this.updateView();
  }
  
  markAsIncomplete(todo: Todo){
    todo.status = TaskStatus.Todo;
    delete todo.completedDate;
    this.toast.showToast(`'${todo.title}'  is marked as incomplete`, ToastType.Info);
    this.updateView();
  }

  deleteTodo(todo: Todo): void {
    this.service.deleteTodo(todo);
    this.updateView();
  }
  
  editTask(todo: Todo) {
    this.toast.showToast(`Modifying '${todo.title}`, ToastType.Info)
    const dialogRef = this.dialog.open(EditTaskComponent, { data: todo });
    dialogRef.afterClosed().subscribe(result => {
      this.updateView();
      console.log(result);
    });
  }
  
  confirmDeletion(todo: Todo) {
    const dialogRef = this.dialog.open(ConfimrationDialogComponent, { data: todo });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.deleteTodo(todo);
      };
    });
  }

  newTaskAdded(){
    if(this.showOverdueTasks){
      this.showOverdueTodos();
    }
    this.updateView();
  }
  
  updateView() {
    this.incompleteTasks = this.service.getTodos().filter(todo => todo.status === (TaskStatus.Todo));
    this.ongoingTasks = this.service.getTodos().filter(todo => todo.status === (TaskStatus.InProgress));
    this.unsortedCompletedTasks = this.service.getTodos().filter(todo => todo.status === TaskStatus.Completed);
    this.completedTasks = this.unsortedCompletedTasks.sort((a, b) => (b.completedDate as Date).getTime() - (a.completedDate as Date).getTime());
    this.filterOverdueTasks();
  }
}
