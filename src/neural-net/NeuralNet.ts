import { mapRow, rowZip, vector } from './batchMath'
import {
  TransformationFactory,
  pipeTransform,
  regularize,
  UniformTransformation,
} from './transform'

/**
 * Neural net defined in a way that allows a batch to be
 * collected by running individual forward passes, collecting
 * the results into a batch, and then updating the net with
 * the entire batch at once.
 */
export default class NeuralNet {
  learningRate: number
  learningDecay: number
  inputSize: number
  transform: UniformTransformation<any>

  constructor(
    config: {
      learningRate: number
      learningDecay?: number
      inputSize: number
      serializedContent?: string
    },
    ...transformFactories: TransformationFactory[]
  ) {
    this.inputSize = config.inputSize
    this.learningRate = config.learningRate
    this.learningDecay = config.learningDecay || 1
    this.transform = regularize(
      pipeTransform(...transformFactories)({
        size: config.inputSize,
        serializedContent: config.serializedContent,
      }),
    )
  }

  passForward(input: number[]): { output: number[]; trace: unknown } {
    return this.transform.passForward(input)
  }

  passBack(feedBack: { trace: unknown; error: number[] }[]) {
    // TODO not utilized currently, and may not ever be so I'm
    // TODO leaving error heat-maps commented out
    // const heat = vector(this.inputSize, () => 0)
    // const mean = vector(this.inputSize, () => 0)
    for (let { trace, error } of feedBack) {
      const scaledError = mapRow(error, n => n * this.learningRate)
      // const inputError =
      this.transform.passBack(trace, scaledError)
      // rowZip(heat, inputError, (a, b) => a + Math.abs(b), heat)
      // rowZip(mean, inputError, (a, b) => a + b, mean)
    }
    this.transform.applyLearning(1 / feedBack.length)
    this.learningRate *= this.learningDecay
    // return { heat, mean }
  }

  serialize(): string {
    return this.transform.serialize()
  }
}
