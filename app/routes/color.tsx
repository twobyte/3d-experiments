import React, { useState, useEffect } from 'react';

const OklchForm = () => {
    // Initialise state for the three parameters.
    const [lightness, setLightness] = useState(0.8);
    const [chroma, setChroma] = useState(0.23);
    const [hue, setHue] = useState(135);

    // Use the lightness value to choose a contrasting text colour.
    // When the background is dark (L < 0.5) use white text; otherwise, use black.
    const textColor = lightness < 0.5 ? '#FFF' : '#000';

    // Update CSS variables globally.
    useEffect(() => {
        const brandColor = `oklch(${lightness} ${chroma} ${hue}deg)`;
        document.documentElement.style.setProperty('--brand-color', brandColor);
        document.documentElement.style.setProperty('--brand-contrast', textColor);
    }, [lightness, chroma, hue, textColor]);

    return (
        <div className="max-w-xs py-12 mx-auto text-brand-contrast">
            <form>
                {/* Lightness Slider */}
                <div className="mb-4">
                    <label>
                        Lightness (L): {Math.round(lightness * 100)}%
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={lightness}
                            onChange={(e) => setLightness(parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </label>
                </div>

                {/* Chroma Slider */}
                <div className="mb-4">
                    <label>
                        Chroma (C): {chroma.toFixed(2)}
                        <input
                            type="range"
                            min="0"
                            max="0.4"
                            step="0.01"
                            value={chroma}
                            onChange={(e) => setChroma(parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </label>
                </div>

                {/* Hue Slider */}
                <div className="mb-4">
                    <label>
                        Hue (H): {hue}°
                        <input
                            type="range"
                            min="0"
                            max="360"
                            step="1"
                            value={hue}
                            onChange={(e) => setHue(parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </label>
                </div>
            </form>

            {/* Display the current oklch() colour */}
            <div style={{ marginTop: '1rem' }}>
                <strong>Current color:</strong> {`oklch(${lightness} ${chroma} ${hue}deg)`}
            </div>
        </div>
    );
};

export default OklchForm;