export interface Todo {
    id: number;
    title: string;
    dueDate?: Date;
    completed: boolean;
    completedDate?: Date;
    description?: string
}