export class ConcurrentManager {
  static readonly locks: Map<number, Promise<void>> = new Map();

  static async acquireLock(userId: number): Promise<() => void> {
    // 락을 점유하고 있으면?
    while (this.locks.has(userId)) {
      // 기존에 설정된 락이 해지 될때까지 대기한다.
      // 1. <pending> 상태가 끝났는지 확인한다.
      // 2. <pending> 상태가 끝났다는 의미는 이 함수의 리턴문의 익명함수가 실행 되었다는 의미이다.
      //     -> 익명함수가 실행되면?
      //     -> 프로미스는 resolve되고 Map에 있는 값이 제거된다.
      // 3. resolve 상태가 된 해당 코드는 다시 while문 실행조건으로 이동한다.
      // 4. this.locks.has(userId)는 false로 판별되어 while문은 종료하고 다음 코드가 실행된다.
      await this.locks.get(userId);
    }

    let resolver: () => void;
    let rejecter: () => void;
    const lockPromise = new Promise<void>(
      (resolve, reject) => ((resolver = resolve), (rejecter = reject)),
    );
    // key에 값으로 <pending> 상태의 프로미스를 값으로 할당
    this.locks.set(userId, lockPromise);

    // 익명함수
    return () => {
      this.locks.delete(userId); // 락 해지
      resolver(); // <pending> -> resolve 상태로 변경 -> await 종료된다.
      rejecter();
    };
  }
}
