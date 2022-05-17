export interface Opt {
  base: string;
  name: string;
  duration: number;
}
declare function cache(options: Partial<Opt> = {}): {
  put: (name: string, data: any, callback: any) => any;
  get: <T>(name: string, callback: (err: Error, data: T) => any) => any;
  delete: (name: string, callback: any) => void;
  putSync: (name: string, data: any) => void;
  getSync: <T>(name: string) => T;
  deleteSync: (name: string) => void;
  keys: (callback: any) => any;
  keysSync: () => any;
  unlink: (callback: any) => any;
};
export default cache;
