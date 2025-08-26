import { NumberListPipe } from './number-list.pipe';

describe('NumberListPipe', () => {
  it('create an instance', () => {
    const pipe = new NumberListPipe();
    expect(pipe).toBeTruthy();
  });
});
