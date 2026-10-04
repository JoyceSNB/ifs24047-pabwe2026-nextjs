import { configureStore } from "@reduxjs/toolkit";
import {
  isAuthLoginReducer,
  isAuthRegisterReducer,
  isAuthLogoutReducer,
} from "@/features/auth/states/reducer";
import {
  usersReducer,
  userReducer,
  profileReducer,
  isProfileReducer,
  isChangeProfileReducer,
  isChangeProfilePhotoReducer,
  isChangeProfilePasswordReducer,
} from "@/features/users/states/reducer";
import {
  postsReducer,
  postReducer,
  isPostReducer,
  isPostAddReducer,
  isPostAddedReducer,
  isPostChangeReducer,
  isPostChangedReducer,
  isPostChangeCoverReducer,
  isPostChangedCoverReducer,
  isPostDeleteReducer,
  isPostDeletedReducer,
  isPostLikeReducer,
  isPostLikedReducer,
  isPostAddCommentReducer,
  isPostAddedCommentReducer,
  isPostDeleteCommentReducer,
  isPostDeletedCommentReducer,
  isPostDeleteAllReducer,
  isPostDeletedAllReducer,
} from "@/features/posts/states/reducer";

export const reducers = {
  // Auth reducers
  isAuthLogin: isAuthLoginReducer,
  isAuthRegister: isAuthRegisterReducer,
  isAuthLogout: isAuthLogoutReducer,

  // Users reducers
  users: usersReducer,
  user: userReducer,
  profile: profileReducer,
  isProfile: isProfileReducer,
  isChangeProfile: isChangeProfileReducer,
  isChangeProfilePhoto: isChangeProfilePhotoReducer,
  isChangeProfilePassword: isChangeProfilePasswordReducer,

  // Posts reducers
  posts: postsReducer,
  post: postReducer,
  isPost: isPostReducer,
  isPostAdd: isPostAddReducer,
  isPostAdded: isPostAddedReducer,
  isPostChange: isPostChangeReducer,
  isPostChanged: isPostChangedReducer,
  isPostChangeCover: isPostChangeCoverReducer,
  isPostChangedCover: isPostChangedCoverReducer,
  isPostDelete: isPostDeleteReducer,
  isPostDeleted: isPostDeletedReducer,
  isPostLike: isPostLikeReducer,
  isPostLiked: isPostLikedReducer,
  isPostAddComment: isPostAddCommentReducer,
  isPostAddedComment: isPostAddedCommentReducer,
  isPostDeleteComment: isPostDeleteCommentReducer,
  isPostDeletedComment: isPostDeletedCommentReducer,
  isPostDeleteAll: isPostDeleteAllReducer,
  isPostDeletedAll: isPostDeletedAllReducer,
};

const store = configureStore({
  reducer: reducers,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;