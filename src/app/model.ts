export enum TaskStatus {
    Todo = 'todo',
    InProgress = 'ongoing',
    Completed = 'completed'
}

export interface Todo {
    id: number;
    title: string;
    dueDate?: Date;
    status: TaskStatus;
    completedDate?: Date;
    description?: string
}