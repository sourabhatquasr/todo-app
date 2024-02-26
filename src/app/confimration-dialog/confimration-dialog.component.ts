import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Todo } from '../model';

@Component({
  selector: 'app-confimration-dialog',
  templateUrl: './confimration-dialog.component.html',
  styleUrls: ['./confimration-dialog.component.css']
})
export class ConfimrationDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: Todo){}

}
