## 동시성 제어 방식에 대한 분석 및 보고서

### 구현된 코드

`ConcurrentManager` 클래스는 정적 메서드 방식으로 제공하게 했습니다.
정적 메서드 방식으로 제공한 이유는 요구사항을 해결하기에는 충분하다고 생각되었기 때문입니다.
처음에는 Nestjs 모듈로 만들어서 의존성 주입을 사용해 인스턴스를 사용하는 방법과, 데코레이터를 사용하는 방법도 고민했습니다. 
하지만 그것보다는 현재 요구사항을 만족할 수 있는 적합한 방식을 사용하는 방향으로 생각을 정리했습니다.

```typescript
export class ConcurrentManager {
  static readonly locks: Map<number, Promise<void>> = new Map();

  static async acquireLock(userId: number): Promise<() => void> {
    while (this.locks.has(userId)) {
      // 기존에 설정된 락이 해지 될때까지 반복문을 돌며 확인한다.
      // 1. <pending> 상태가 끝났는지 확인한다.
      // 2. <pending> 상태가 끝났다는 의미는 이 함수의 리턴문의 익명함수가 실행 되었다는 의미이다.
      //     -> 익명함수가 실행되면?
      //     -> 프로미스는 resolve되고 Map에 있는 값이 제거된다.
      // 3. resolve 상태가 된 해당 코드는 다시 while문 실행조건으로 이동한다.
      // 4. this.locks.has(userId)는 false로 판별되어 while문은 종료하고 다음 코드가 실행된다.
      await this.locks.get(userId);
    }

    // <pending> 할당
    let resolver: () => void; 
    let rejecter: () => void;
    const lockPromise = new Promise<void>( 
      (resolve, reject) => ((resolver = resolve), (rejecter = reject)),
    );
    // key에 값으로 <pending> 상태의 프로미스를 값으로 할당
    this.locks.set(userId, lockPromise);

    // 익명함수로 외부에 락 해지 기능을 전달한다.
    return () => {
      this.locks.delete(userId); // 락 해지
      resolver(); // 성공시 <pending> -> resolve 상태로 변경 -> await 종료된다.
      rejecter(); // 에러시 <pending> -> resolve 상태로 변경 -> await 종료된다.
    };
  }
}
```

위의 코드는 JavaScript의 Promise와 await를 활용하여 스핀락을 구현한 코드입니다.
코드의 핵심은 await가 걸려있는 Promise가 <pending> 상태인 경우 generator에 의해 코드의 프로그램 카운터가 멈추게 되는 원리를 사용하는 것입니다.

#### 락 획득 프로세스
- 대기 루프: while 루프를 통해 해당 사용자 ID에 대한 락이 이미 존재하는지 확인합니다.
- 락 생성: 새로운 Promise를 생성하고, 이를 locks Map에 저장합니다.
- 락 해제 함수 반환: 락을 해제할 수 있는 함수를 반환합니다.

#### 스핀락 구현의 핵심
- `await` 활용: `await this.locks.get(userId)`를 통해 기존 락이 해제될 때까지 대기합니다.
- Promise 상태 활용: <pending> 상태의 Promise를 사용하여 락을 표현하고, resolve 또는 reject 함으로써 락을 해제합니다.

#### 한계
이 구현은 실제 스핀락과 달리 CPU를 지속적으로 점유하는 방법은 아닙니다. 락을 획득을 코드상으로만 구현한 것이기 때문입니다.
또한 요구 사항에 따라 동시성을 nodejs 자체의 기능을 활용해 구현하기는 했지만 성능이 좋지 않다는 치명적인 한계가 있습니다.
  