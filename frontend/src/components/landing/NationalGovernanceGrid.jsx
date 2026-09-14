import React, { useEffect, useState } from 'react';

const NationalGovernanceGrid = () => {
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    fetch('/national-governance-grid.svg')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load SVG');
        return res.text();
      })
      .then((data) => {
        // Strip <?xml ...?> declaration if present when inserting into innerHTML
        const cleanSvg = data.replace(/<\?xml[\s\S]*?\?>/i, '').trim();
        setSvgContent(cleanSvg);
      })
      .catch((err) => {
        console.error('Error loading National Governance Grid SVG:', err);
      });
  }, []);

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto">
      <div 
        className="w-full relative overflow-hidden rounded-2xl shadow-sm bg-transparent"
        style={{ aspectRatio: '7463.348 / 3889.042' }}
      >
        {svgContent ? (
          <div 
            className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block [&>svg]:object-contain"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <img 
            src="/national-governance-grid.svg" 
            alt="National Governance Dashboard"
            className="w-full h-full object-contain block"
            loading="eager"
          />
        )}
      </div>
    </section>
  );
};

export default NationalGovernanceGrid;
