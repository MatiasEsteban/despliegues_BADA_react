import React from 'react';

export default function BadaGraph({ pasos = [] }) {
    const total = pasos.length;

    if (total === 0) {
        return <div className="bada-graph-container"><span className="bada-graph-empty">N/A</span></div>;
    }

    const v1Count = pasos.filter(p => p.version === 'V1').length;
    const v2Count = pasos.filter(p => p.version === 'V2').length;

    const v1Percent = (v1Count / total) * 100;
    const v2Percent = (v2Count / total) * 100;

    return (
        <div className="bada-graph-container">
            <div className="bada-graph-bar">
                <svg
                    className="bada-graph"
                    viewBox="0 0 100 12"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    focusable="false"
                >
                    {v1Count > 0 && (
                        <rect className="bada-segment segment-v1" x={0} y={0} width={v1Percent} height={12} />
                    )}
                    {v2Count > 0 && (
                        <rect className="bada-segment segment-v2" x={v1Percent} y={0} width={v2Percent} height={12} />
                    )}
                </svg>
            </div>
            <div className="bada-graph-labels">
                {v1Count > 0 && <span className="label-v1">V1: {Math.round(v1Percent)}%</span>}
                {v2Count > 0 && <span className="label-v2">V2: {Math.round(v2Percent)}%</span>}
            </div>
        </div>
    );
}