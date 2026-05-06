import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';
import * as d3 from 'd3';
import { SajuData, ELEMENT_COLORS, ELEMENT_NAMES } from '../lib/saju';

interface SajuVisualsProps {
  data: SajuData;
}

export const ElementRadarChart: React.FC<SajuVisualsProps> = ({ data }) => {
  const chartData = [
    { subject: '목(木)', A: data.fiveElements.wood, fullMark: 5 },
    { subject: '화(火)', A: data.fiveElements.fire, fullMark: 5 },
    { subject: '토(土)', A: data.fiveElements.earth, fullMark: 5 },
    { subject: '금(金)', A: data.fiveElements.metal, fullMark: 5 },
    { subject: '수(水)', A: data.fiveElements.water, fullMark: 5 },
  ];

  return (
    <div className="w-full h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }} />
          <Radar
            name="오행 에너지"
            dataKey="A"
            stroke="#8b0000"
            fill="#8b0000"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DestinyNetwork: React.FC<SajuVisualsProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 400;
    const height = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes = [
      { id: 'Self', group: 'core', label: '나(自身)', size: 40 },
      { id: 'Wood', group: 'element', label: '목(木)', value: data.fiveElements.wood },
      { id: 'Fire', group: 'element', label: '화(火)', value: data.fiveElements.fire },
      { id: 'Earth', group: 'element', label: '토(土)', value: data.fiveElements.earth },
      { id: 'Metal', group: 'element', label: '금(金)', value: data.fiveElements.metal },
      { id: 'Water', group: 'element', label: '수(水)', value: data.fiveElements.water },
    ];

    const links = [
      { source: 'Self', target: 'Wood' },
      { source: 'Self', target: 'Fire' },
      { source: 'Self', target: 'Earth' },
      { source: 'Self', target: 'Metal' },
      { source: 'Self', target: 'Water' },
      // Mutual Generation
      { source: 'Wood', target: 'Fire' },
      { source: 'Fire', target: 'Earth' },
      { source: 'Earth', target: 'Metal' },
      { source: 'Metal', target: 'Water' },
      { source: 'Water', target: 'Wood' },
    ];

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#eee")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", (d: any) => d.group === 'core' ? 25 : 10 + d.value * 3)
      .attr("fill", (d: any) => {
        if (d.group === 'core') return '#8b0000';
        const key = d.id.toLowerCase();
        return ELEMENT_COLORS[key] || '#ccc';
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dy", 35)
      .attr("text-anchor", "middle")
      .text((d: any) => d.label)
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "#666");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="w-full aspect-square max-w-[400px] mx-auto overflow-hidden rounded-full bg-zinc-50 border border-zinc-100 relative group">
      <svg ref={svgRef} viewBox="0 0 400 400" className="w-full h-full cursor-move" />
      <div className="absolute inset-x-0 bottom-4 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
         <span className="text-[10px] bg-white/80 backdrop-blur px-2 py-1 rounded-full text-zinc-400 border border-zinc-100">Drag to explore destiny energy</span>
      </div>
    </div>
  );
};
