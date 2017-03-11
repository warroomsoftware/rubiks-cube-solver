const RubiksCube = require('../../models/RubiksCube')
const BaseSolver = require('./BaseSolver')
const utils = require('../../utils')

const R = (moves) => RubiksCube.reverseMoves(moves)

/**
 * Top level case 2:
 * Corner is on the DOWN face and edge is not on DOWN or UP face.
 */
class case2Solver extends BaseSolver {
  solve({ corner, edge }) {
    let caseNum = this._getCaseNumber({ corner, edge })
    this[`_solveCase${caseNum}`]({ corner, edge })
  }

  /**
   * 4 cases:
   *
   * ---- Group 1: Corner's white color is on DOWN face ----
   * 1) Pair can be matched up.
   * 2) Pair cannot be matched up.
   *
   * ---- Group 2: Corner's white color is not on DOWN face ----
   * 3) Corner's other color can match up with the edge color on that face.
   * 4) Corner's other color cannot match up with the edge color on that face.
   */
  _getCaseNumber({ corner, edge }) {
    // get relative right faces of corner and edge
    let cFaces = corner.faces().filter(face => face !== 'DOWN')
    let eFaces = edge.faces()
    let cornerDir = utils.getDirectionFromFaces(cFaces[0], cFaces[1], { UP: 'DOWN' })
    let edgeDir = utils.getDirectionFromFaces(eFaces[0], eFaces[1], { UP: 'DOWN' })
    let cornerRight = cornerDir === 'RIGHT' ? cFaces[1] : cFaces[0]
    let edgeRight = edgeDir === 'RIGHT' ? eFaces[1] : eFaces[0]

    if (corner.getFaceOfColor('U') === 'DOWN') {
      if (corner.getColorOfFace(cornerRight) === edge.getColorOfFace(edgeRight)) {
        return 1
      } else {
        return 2
      }
    }

    let otherColor = corner.colors().find(color => {
      return color !== 'U' && color !== corner.getColorOfFace('DOWN')
    })
    let isLeft = utils.getDirectionFromFaces(
      corner.getFaceOfColor(otherColor),
      corner.getFaceOfColor('U'),
      { UP: 'DOWN' }
    )
    let matchingEdgeColor = isLeft ?
      edge.getColorOfFace(edgeRight) :
      edge.colors().find(c => edge.getFaceOfColor !== edgeRight)

    if (otherColor === matchingEdgeColor) {
      return 3
    } else {
      return 4
    }
  }

  _solveCase1({ corner, edge }) {
    let currentFace = corner.getFaceOfColor(edge.colors()[0])
    let targetFace = utils.getFaceOfMove(edge.colors()[1])

    let prep = utils.getRotationFromTo('DOWN', currentFace, targetFace)
    this.move(prep)

    let dir = utils.getDirectionFromFaces(edge.faces()[0] , edge.faces()[1], { UP: 'DOWN' })
    let rightFace = edge.faces()[dir === 'RIGHT' ? 1 : 0]

    this.move(`${rightFace} DPrime`)
    this.solveMatchedPair({ corner, edge })
  }

  _solveCase2({ corner, edge }) {
    let currentFace = corner.getFaceOfColor(edge.colors()[0])
    let targetFace = utils.getFaceOfMove(edge.colors()[1])

    let prep = utils.getRotationFromTo('DOWN', currentFace, targetFace)
    this.move(prep)

    let dir = utils.getDirectionFromFaces(edge.faces()[0] , edge.faces()[1], { UP: 'DOWN' })
    let rightFace = edge.faces()[dir === 'RIGHT' ? 1 : 0]

    let moves = `${rightFace} D ${R(rightFace)} DPrime`
    this.move(`${moves} ${moves}`)

    this.solveSeparatedPair({ corner, edge })
  }

  _solveCase3({ corner, edge }) {
    this._case3And4Helper({ corner, edge }, 3)
  }

  _solveCase4({ corner, edge }) {
    this._case3And4Helper({ corner, edge }, 4)
  }

  _case3And4Helper({ corner, edge }, caseNum) {
    let matchingColor = corner.getColorOfFace('DOWN')
    let otherColor = corner.colors().find(c => ![matchingColor, 'U'].includes(c))
    let isLeft = utils.getDirectionFromFaces(
      corner.getFaceOfColor(otherColor),
      corner.getFaceOfColor('U'),
      { UP: 'DOWN' }
    ) === 'LEFT'

    let currentFace = corner.getFaceOfColor('U')
    let targetFace = utils.getFaceOfMove(otherColor)

    let prep = utils.getRotationFromTo('DOWN', currentFace, targetFace)
    let moveFace = utils.getFaceOfMove(otherColor)
    moveFace = isLeft ? moveFace : R(moveFace)
    let dir = isLeft ? 'DPrime' : 'D'
    dir = caseNum === 3 ? dir : R(dir)

    this.move(`${prep} ${moveFace} ${dir} ${R(moveFace)}`)

    let method = `solve${caseNum === 3 ? 'Matched' : 'Separated'}Pair`
    this[method]({ corner, edge })
  }
}

module.exports = case2Solver
