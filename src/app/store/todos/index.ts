import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Server } from '../../utils/config';
import { Todo } from 'src/app/models/Todo';
import { Api } from 'src/app/helpers/api';

/** State Model */
export class TodoStateModel {
  todos: any[];
}

/** Actions */
export class FetchTodos {
  static readonly type = '[Todo] FetchTodos';
}

export class AddTodo {
  static readonly type = '[Todo] AddTodo';
  constructor(
    public payload: { data: Todo; read: string[]; write: string[] }
  ) {}
}

export class UpdateTodo {
  static readonly type = '[Auth] DeleteTodo';
  constructor(
    public payload: {
      documentId: string;
      data: Todo;
      read: string[];
      write: string[];
    }
  ) {}
}

export class DeleteTodo {
  static readonly type = '[Todo] DeleteTodo';
  constructor(public payload: { documentId: string }) {}
}

@State<TodoStateModel>({
  name: 'todo',
  defaults: {
    todos: [],
  },
})
@Injectable()
export class TodoState {
  @Selector()
  static getTodos(state: TodoStateModel): Todo[] | Array<Todo> {
    return state.todos;
  }

  @Action(FetchTodos)
  async fetchTodos(
    { patchState }: StateContext<TodoStateModel>,
    action: FetchTodos
  ) {
    try {
      let todos = (await Api.provider().database.listDocuments(
        Server.collectionID
      )) as [];
      patchState({
        todos: todos,
      });
    } catch (e) {
      console.log('Failed to fetch todos');
    }
  }

  @Action(AddTodo)
  async addTodo(
    { patchState, getState }: StateContext<TodoStateModel>,
    action: AddTodo
  ) {
    try {
      let { data, read, write } = action.payload;
      let todo = (await  Api.provider().database.createDocument(
        Server.collectionID,
        data,
        read,
        write
      ));
      var todos = getState().todos;
      todos.unshift(todo);
      patchState({
          todos
      })
    } catch (e) {
      console.log('Failed to add todo');
    }
  }

  @Action(UpdateTodo)
  async updateTodo(
    { patchState, getState }: StateContext<TodoStateModel>,
    action: UpdateTodo
  ) {
    let { documentId, data, read, write } = action.payload;
    try {
      let updatedTodo = await Api.provider().database.updateDocument(
        Server.collectionID,
        documentId,
        data,
        read,
        write
      ) as any;
      let todos = getState().todos;
      const index = todos.findIndex(
        (todo) => todo["$id"] === updatedTodo["$id"]
      );
      if (index !== -1) {
        todos.splice(index, 1, updatedTodo);
        patchState({
            todos
        })
      }
    } catch (e) {
      console.log('Failed to update todo');
    }
  }

  @Action(DeleteTodo)
  async deleteTodo(
    { patchState, getState }: StateContext<TodoStateModel>,
    action: DeleteTodo
  ) {
    let { documentId } = action.payload;
    try {
      await Api.provider().database.deleteDocument(Server.collectionID, documentId);
      let todos = getState().todos
      todos.filter((todo) => todo["$id"] !== documentId)
      patchState({
          todos
      })
    } catch (e) {
      console.log('Failed to delete todo');
    }
  }
}
