declare namespace Express {
  interface Request {
    user?: import("./index").AuthUser;
  }
}
