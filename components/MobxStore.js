import { makeAutoObservable } from 'mobx';

class CommentStore {
  comments = [];
  allComments = [];

  constructor() {
    makeAutoObservable(this);
  }

  loadComments(storedComments) {
    this.comments = storedComments;
    this.allComments = storedComments;
  }

  saveComments(newComments) {
    this.comments = newComments;
    this.allComments = newComments;
  }

  addComment(comment) {
    this.comments.push(comment);
    this.allComments.push(comment);
  }

  editComment(index, updatedComment) {
    this.comments[index] = updatedComment;
    this.allComments[index] = updatedComment;
  }

  deleteComment(index) {
    this.comments.splice(index, 1);
    this.allComments.splice(index, 1);
  }

  filterComments(keyword) {
    this.comments = this.allComments.filter(item => item.text.includes(keyword));
  }

  resetFilter() {
    this.comments = this.allComments;
  }
}

const commentStore = new CommentStore();
export default commentStore;
