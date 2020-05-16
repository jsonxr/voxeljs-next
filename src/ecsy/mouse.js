import {Component, System} from 'ecsy'
import {Vector2} from 'three'
import {InputFrame} from './input.js'

const LEFT_MOUSE_BUTTON = 1
const RIGHT_MOUSE_BUTTON = 2

export class MouseCursor extends Component {
    constructor() {
        super();
        this.position = new Vector2()
        this.buttons = 0
        this.down = false
    }
}
export class MouseSystem extends System {
    _mouse_down(e) {
        this.pressed = true
        this.buttons = e.buttons
        this.start_point = this.last_point.clone()
        this.queries.inputs.results.forEach(ent => {
            let input = ent.getMutableComponent(InputFrame)
            input.state[InputFrame.ROTATION_DRAGGING] = true
            this.start_angle = input.state[InputFrame.ROTATION_ANGLE]
        })

    }
    _mouse_move(e) {
        this.last_point = new Vector2(e.clientX,e.clientY)
        if(this.pressed) {
            let diff = this.last_point.clone().sub(this.start_point)
            let new_angle = this.start_angle - 0.003*diff.x
            this.queries.inputs.results.forEach(ent => {
                let input = ent.getMutableComponent(InputFrame)
                input.state[InputFrame.ROTATION_ANGLE] = new_angle
            })
        }
    }
    _mouse_up(e) {
        this.pressed = false
        console.log('mouse up')
        let diff = this.last_point.clone().sub(this.start_point)
        this.queries.inputs.results.forEach(ent => {
            let input = ent.getMutableComponent(InputFrame)
            input.state[InputFrame.ROTATION_DRAGGING] = false
            if(Math.abs(diff.x) < 10) {
                if(this.buttons === RIGHT_MOUSE_BUTTON) {
                    input.state[InputFrame.CREATE_AT_CURSOR] = true
                }
                if(this.buttons === LEFT_MOUSE_BUTTON) {
                    input.state[InputFrame.DESTROY_AT_CURSOR] = true
                }

            }
        })
    }
    init() {
        this.last_point = new Vector2(200,200)
        document.addEventListener('contextmenu',e => {
            e.preventDefault()
            e.stopPropagation()
        })
        document.addEventListener('mousemove',(e)=>this._mouse_move(e))
        document.addEventListener('mousedown', (e)=>this._mouse_down(e))
        document.addEventListener('mouseup', (e)=>this._mouse_up(e))
    }
    execute(delta,time) {
        this.queries.targets.results.forEach(ent => {
            ent.getMutableComponent(MouseCursor).position.copy(this.last_point)
        })
    }
}
MouseSystem.queries = {
    targets: {
        components: [MouseCursor]
    },
    inputs: {
        components: [InputFrame],
    }
}
