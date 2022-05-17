export interface Opt {
  base: string;
  name: string;
  duration: number;
}
declare function cache(options: Partial<Opt> = {}): {
  put: (name: string, data: any, cb: any) => any;
  get: (name: string, cb: any) => any;
  delete: (name: string, cb: any) => void;
  putSync: (name: string, data: any) => void;
  getSync: (name: string) => any;
  deleteSync: (name: string) => void;
  keys: (cb: any) => any;
  keysSync: () => any;
  unlink: (cb: any) => any;
};
export default cache;
