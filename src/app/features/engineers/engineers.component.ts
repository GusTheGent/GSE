import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User } from '../../shared/interfaces/User';
import { IndexedDatabase } from '../../shared/database/db';

@Component({
  selector: 'app-engineers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './engineers.component.html',
  styleUrl: './engineers.component.scss',
})
export class EngineersComponent implements OnInit {
  private db = new IndexedDatabase();
  public engineers: User[] = [];

  public engineerRegistry = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.db.getAllUsers().then((engineers) => {
      this.engineers = engineers;
    });
  }

  public onSubmit(): void {
    this.db.addUser(this.engineerRegistry.value as User).then(() => {
      this.db.getAllUsers().then((engineers) => {
        this.engineers = engineers;
      });
    });
  }
}
