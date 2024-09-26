/**
 * PointManager 객체
 * - 현재는 단순하게 충전/사용이 가능한가 체크하는 기능만 있기 때문에 정적 메서드를 가진 클래스만 관리한다.
 */
export class PointManager {
  static readonly MAX_POINT = 30000;
  static readonly MIN_POINT = 0;

  static addPoint(point: number, amount: number) {
    return point + amount;
  }

  static subPoint(point: number, amount: number) {
    return point - amount;
  }

  /**
   * 포인트 충전 가능한지 확인하는 메서드
   * @param currantPoint 현재 포인트
   * @param amount 충전할 금액
   * @returns 충전 가능 유무
   */
  static canChargePoint(currantPoint: number, amount: number) {
    return currantPoint + amount <= PointManager.MAX_POINT;
  }

  /**
   * 포인트 사용 가능한지 확인하는 메서드
   * @param currantPoint 현재 포인트
   * @param amount 사용할 금액
   * @returns 사용 가능 유무
   */
  static canUsePoint(currantPoint: number, amount: number) {
    return currantPoint - amount >= PointManager.MIN_POINT;
  }
}
