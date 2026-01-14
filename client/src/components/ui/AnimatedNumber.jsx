import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';

const AnimatedNumber = ({ value }) => {
    const animatedValue = useCountUp(value, 1000);
    return <span>{animatedValue}</span>;
};

export default AnimatedNumber;
