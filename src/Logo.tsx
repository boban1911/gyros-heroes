import React from 'react';
import vector from './assets/Figma basics/Vector.png';
import vector1 from './assets/Figma basics/Vector-1.png';
import vector2 from './assets/Figma basics/Vector-2.png';
import vector3 from './assets/Figma basics/Vector-3.png';
import vector4 from './assets/Figma basics/Vector-4.png';
import vector5 from './assets/Figma basics/Vector-5.png';
import vector6 from './assets/Figma basics/Vector-6.png';
import vector7 from './assets/Figma basics/Vector-7.png';
import vector8 from './assets/Figma basics/Vector-8.png';
import vector9 from './assets/Figma basics/Vector-9.png';
import group from './assets/Figma basics/Group.png';

export default function Logo() {
  return (
    <div className="relative w-full h-full">
      <img alt="" className="absolute inset-0 w-full h-full" src={vector} />
      <img alt="" className="absolute left-[81.96%] top-[24.79%] w-[15%] h-[22.55%]" src={vector9} />
      <img alt="" className="absolute left-[9.0%] top-[46.29%] w-[21.38%] h-[32.63%]" src={vector8} />
      <img alt="" className="absolute left-[30.45%] top-[46.38%] w-[22.19%] h-[22.52%]" src={vector7} />
      <div className="absolute left-[26.38%] top-[69.49%] w-[54.38%] h-[25.47%]">
        <img alt="" className="absolute left-0 top-[5.19%] w-[48.81%] h-[94.8%]" src={vector5} />
        <img alt="" className="absolute right-0 top-0 w-[50.02%] h-[99.08%]" src={vector6} />
      </div>
      <img alt="" className="absolute left-[73.04%] top-[51.14%] w-[21.71%] h-[17.47%]" src={vector4} />
      <img alt="" className="absolute left-[10.25%] top-[5.36%] w-[24.7%] h-[41.04%]" src={vector3} />
      <img alt="" className="absolute left-[34.08%] top-[8.18%] w-[12.75%] h-[35.17%]" src={vector2} />
      <img alt="" className="absolute left-[65.41%] top-[24.87%] w-[15.66%] h-[22.05%]" src={vector1} />
      <img alt="" className="absolute left-[47.36%] top-[4.33%] w-[29.91%] h-[35.08%]" src={group} />
      {/* vector is the big background circle, typically */}
    </div>
  );
}
