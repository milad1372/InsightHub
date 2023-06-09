import React, { useCallback, useEffect, useState, useRef } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import './styles.css';

interface RangeSliderProps {
  min: number;
  max: number;
  defaultMin: number;
  defaultMax: number;
  onChange: any;
}

const RangeSlider = ({ min, max, defaultMin, defaultMax, onChange }: RangeSliderProps) => {
  const [minVal, setMinVal] = useState(defaultMin);
  const [maxVal, setMaxVal] = useState(defaultMax);
  const minValRef = useRef<any>(null);
  const maxValRef = useRef<any>(null);
  const range = useRef<any>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(+maxValRef.current.value);

      if (range.current) {
        range.current.style.left = `${minPercent}%`;
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value);
      const maxPercent = getPercent(maxVal);

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`;
      }
    }
  }, [maxVal, getPercent]);

  // Get min and max values when their state changes
  useEffect(() => {
    onChange({ min: minVal, max: maxVal });
  }, [minVal, maxVal, onChange]);

  return (
    <div className="slider-container">
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        ref={minValRef}
        onChange={(event) => {
          const value = Math.min(+event.target.value, maxVal - 1);
          setMinVal(value);
          event.target.value = value.toString();
        }}
        className={classnames('thumb thumb--zindex-3', {
          'thumb--zindex-5': minVal > max - 100
        })}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        ref={maxValRef}
        onChange={(event) => {
          const value = Math.max(+event.target.value, minVal + 1);
          setMaxVal(value);
          event.target.value = value.toString();
        }}
        className="thumb thumb--zindex-4"
      />

      <div className="slider">
        <div className="slider__track" />
        <div ref={range} className="slider__range" />
        <div className="slider__left-value">{minVal}</div>
        <div className="slider__right-value">{maxVal}</div>
      </div>
    </div>
  );
};

RangeSlider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  defaultMin: PropTypes.number.isRequired,
  defaultMax: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

export default RangeSlider;
