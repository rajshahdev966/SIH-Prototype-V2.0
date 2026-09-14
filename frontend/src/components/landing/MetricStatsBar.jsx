import React from 'react';
import {
  RiTeamLine,
  RiBookOpenLine,
  RiCheckboxCircleLine,
  RiUserFollowLine,
  RiAwardLine
} from '@remixicon/react';

const MetricStatsBar = ({ courseCount = 0 }) => {
  const metrics = [
    {
      icon: RiTeamLine,
      count: '1,72,63,077',
      label: 'Total Karmayogis Onboarded'
    },
    {
      icon: RiBookOpenLine,
      count: courseCount > 0 ? `${(6784 + courseCount).toLocaleString()}` : '6,784',
      label: 'Total Courses'
    },
    {
      icon: RiCheckboxCircleLine,
      count: '15,57,65,355',
      label: 'Total Completions'
    },
    {
      icon: RiUserFollowLine,
      count: '20,91,335',
      label: 'Monthly Active Users'
    },
    {
      icon: RiAwardLine,
      count: '7,71,427',
      label: 'Certificates Issued Yesterday'
    }
  ];

  return (
    <section className="bg-[#0B5C9E] text-white py-6 border-y border-[#09487D] shadow-inner">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4 items-center">
          {metrics.map((m, idx) => {
            const IconComp = m.icon;
            return (
              <div
                key={m.label}
                className={`flex items-center gap-3.5 ${
                  idx !== metrics.length - 1 ? 'lg:border-r lg:border-white/20' : ''
                } pr-3`}
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white">
                  <IconComp size={20} />
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-black tracking-tight font-mono text-white leading-tight">
                    {m.count}
                  </span>
                  <span className="text-[11px] sm:text-xs text-blue-100 font-medium leading-tight line-clamp-1">
                    {m.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MetricStatsBar;
