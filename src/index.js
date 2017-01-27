'use strict';
import { EventEmitter } from 'events';
import VirtualScroll from 'virtual-scroll';
import raf from 'raf';
import transform from 'prefix';

export default class HorizontalScroll extends EventEmitter {

	constructor(opts) {
		super();

		this._bind();

		// Set default options
		this.options = Object.assign({
			container: opts.container,
			blocks: opts.blocks,
			spring: opts.spring  || 0.1,
			springEffect: opts.springEffect || 0.1,
			strengthEffect: opts.strengthEffect || 20
		}, opts);

		this.vars = {
			scrollValue: 0,
			oldScrollValue: 0,
			scrollTarget: 0,
			scrollLeft: 0,
			scrollRight: 0,
			spring: this.options.spring,
			springEffect: this.options.springEffect,
			direction: 0,
			speed: 0,
			speedTarget: 0,
		};

		this.wrapper = document.createElement('div');
		this.wrapper.setAttribute('class', 'horizontal-scroll');

		this.vs = new VirtualScroll();
		this.transform = transform('transform');

		this.raf = raf;

		this._setUI();
		this._addEvents();
		this.onResize();

	}

	// PRIVATE

	/**
	 * Biding methods
	 *
	 */
	_bind() {
		this._update = this._update.bind(this);
		this.onResize = this.onResize.bind(this);
	}

	/**
	 * Add all events
	 *
	 */
	_addEvents() {
		this.vs.on(this._onScroll, this);
		this.raf(this._update);
		window.addEventListener('resize', this.onResize);
	}

	/**
	 * Remove all events
	 *
	 */
	_removeEvents() {
		this.raf.cancel(this._update);
		this.raf(this._update);
		window.removeEventListener('resize', this.onResize);
	}

	/**
	 * Set the UI
	 *
	 */
	_setUI() {

		Object.assign(this.wrapper.style ,{
			position: 'absolute',
			top: '0',
			left: '0',
			'backface-visibility': 'hidden',
			'will-change': 'transform'
		});

		Object.assign(this.options.container[0].style ,{
			'white-space': 'nowrap',
			'position': 'relative',
		});

		for (let block of this.options.blocks) {
			block.style.display = 'inline-block';
			this.options.container[0].replaceChild(this.wrapper, block);
			this.wrapper.appendChild(block);
		}

		this.options.container[0].appendChild(this.wrapper);

	}

	/**
	 * Trigger when user scroll
	 *
	 */
	_onScroll(e) {

		if (e.deltaY > 0) {
			this.vars.direction = 1;
		} else {
			this.vars.direction = -1;
		}

		this.vars.scrollTarget += e.deltaY * -1;
		this.vars.scrollTarget = Math.round(Math.max(this.vars.scrollLeft, Math.min(this.vars.scrollTarget, this.vars.scrollRight)));

	}

	/**
	 * RAF
	 *
	 */
	_update() {

		// SCROLL VALUE
		this.vars.scrollValue += (this.vars.scrollTarget - this.vars.scrollValue) * this.vars.spring;

		//SPEED
		let delta = this.vars.oldScrollValue - this.vars.scrollValue;
		this.vars.speedTarget = Math.round(Math.max(-this.options.strengthEffect, Math.min(delta, this.options.strengthEffect)));
		this.vars.speed += (this.vars.speedTarget - this.vars.speed) * this.vars.springEffect;

		// TRANSFORM
		this.wrapper.style[this.transform] = `translate3d(-${this.vars.scrollValue}px, 0 ,0) skewX(${this.vars.speed}deg)`;

		this.vars.oldScrollValue = this.vars.scrollValue;
		this.raf(this._update);
	}

	// PUBLIC

	/**
	 * Destroy variables and bind events
	 *
	 */

	onResize() {
		this.vars.scrollLeft = 0;
		this.vars.scrollRight = this.wrapper.getBoundingClientRect().width - window.innerWidth;
	}

	destroy() {
		this._removeEvents();
	}

}
