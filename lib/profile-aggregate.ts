/** Переиспользуемые агрегаторы для профиля (общий код API и клиента). */
import { BIAS_LABELS, calibrationCurve, brierScore } from "./metrics";
import type { BiasId } from "./scenario-schema";

export type BiasIdLocal = BiasId;

export { BIAS_LABELS, calibrationCurve, brierScore };
