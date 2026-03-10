import { useState, useEffect } from 'react';

function formatInr(n) {
    const cr = n / 1e7;
    if (cr >= 100) return '₹' + (cr / 100).toFixed(2) + ' Hundred Cr';
    return '₹' + cr.toFixed(2) + ' Cr';
}

export default function useHeroCounter(startValue, incrementPerSecond) {
    const [value, setValue] = useState(startValue);

    useEffect(() => {
        const id = setInterval(() => {
            setValue(v => v + incrementPerSecond);
        }, 1000);
        return () => clearInterval(id);
    }, [incrementPerSecond]);

    return formatInr(value);
}
