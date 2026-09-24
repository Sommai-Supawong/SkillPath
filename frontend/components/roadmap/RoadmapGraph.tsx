"use client";
import { Component, ErrorInfo, ReactNode, useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3 } from "lucide-react";
import { Background, BackgroundVariant, Controls, Handle, NodeProps, Position, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SkillIcon } from "@/components/SkillIcon";
import { SkillBadge } from "@/components/ui";
import { layoutRoadmap, RoadmapFlowNode } from "@/lib/roadmap/layoutRoadmap";
import { RoadmapGraph as GraphData, Roadmap, Skill, Profile } from "@/lib/types";
import { RoadmapDetails, CompletionTarget } from "./RoadmapDetails";

function RoadmapSkillNode({ data, selected }: NodeProps<RoadmapFlowNode>) {
  return <div className={`roadmap-node ${data.status}${selected ? " selected" : ""}`}>
    <Handle type="target" position={data.direction === "TB" ? Position.Top : Position.Left} className="roadmap-handle" />
    <div className="roadmap-node-top"><SkillIcon name={data.name} skillType={data.skill_type} iconKey={data.icon_key} iconKind={data.icon_kind} /><SkillBadge status={data.status} /></div>
    <strong className="roadmap-node-name">{data.name}</strong><span className="roadmap-node-type">{data.skill_type}</span>
    <div className="roadmap-levels"><span>Current <b>{data.current_level}</b></span><ArrowRight size={14} aria-hidden="true" /><span>Target <b>{data.target_level}</b></span></div>
    <span className="roadmap-hours"><Clock3 size={14} />ประมาณ {data.estimated_hours} ชั่วโมง</span>
    <Handle type="source" position={data.direction === "TB" ? Position.Bottom : Position.Right} className="roadmap-handle" />
  </div>;
}
const nodeTypes = { skill: RoadmapSkillNode };
type Props = { graph: GraphData; roadmap: Roadmap; skills: Skill[]; profile: Profile | null; onComplete: (node: CompletionTarget) => void; busy: boolean; onFallback: () => void };

function RoadmapGraphView({ graph, roadmap, skills, profile, onComplete, busy }: Props) {
  const [mobile, setMobile] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    const media = matchMedia("(max-width: 767px)");
    const update = () => setMobile(media.matches); update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const flow = useMemo(() => layoutRoadmap(graph, mobile ? "TB" : "LR"), [graph, mobile]);
  const selected = graph.nodes.find(node => node.id === selectedId);
  useEffect(() => { if (selectedId && !graph.nodes.some(n => n.id === selectedId)) setSelectedId(null); }, [graph.nodes, selectedId]);
  return <><p className="graph-instructions">ลากพื้นที่ว่างเพื่อเลื่อน · ใช้ปุ่ม + / − เพื่อซูม · กด Tab แล้ว Enter เพื่อเลือกทักษะ หรือใช้มุมมองรายการ</p><div className={`roadmap-workspace${selected ? " has-selection" : ""}`}><div className="roadmap-canvas" aria-label="แผนภาพเส้นทางการเรียนรู้">
    <ReactFlow nodes={flow.nodes.map(n => ({ ...n, selected: n.id === selectedId }))} edges={flow.edges} nodeTypes={nodeTypes}
      onNodeClick={(_, node) => setSelectedId(node.id)}
      onKeyDownCapture={event => { const id = (event.target as HTMLElement).closest(".react-flow__node")?.getAttribute("data-id"); if (id && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); event.stopPropagation(); setSelectedId(id); } }}
      fitView fitViewOptions={{ padding: .2 }} minZoom={.35} maxZoom={1.6} nodesDraggable={false} nodesConnectable={false} elementsSelectable zoomOnScroll={false} preventScrolling={false} deleteKeyCode={null} colorMode="dark"
      ariaLabelConfig={{ "controls.zoomIn.ariaLabel": "ขยายแผนภาพ", "controls.zoomOut.ariaLabel": "ย่อแผนภาพ", "controls.fitView.ariaLabel": "แสดงแผนภาพทั้งหมด" }}>
      <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(148,200,255,.12)" /><Controls showInteractive={false} position="bottom-left" />
    </ReactFlow></div>{selected && <RoadmapDetails node={selected} graph={graph} roadmap={roadmap} skills={skills} profile={profile} onComplete={onComplete} busy={busy} onClose={() => setSelectedId(null)} />}</div></>;
}
class GraphBoundary extends Component<{ children: ReactNode; onFallback: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Roadmap view failed", error, info.componentStack); }
  render() { return this.state.failed ? <div className="notice error"><div><p>แผนภาพยังไม่พร้อมใช้งาน คุณยังเรียนต่อผ่านมุมมองรายการได้</p><button className="secondary" onClick={this.props.onFallback}>เปิดมุมมองรายการ</button></div></div> : this.props.children; }
}
export function RoadmapGraph(props: Props) { return <GraphBoundary onFallback={props.onFallback}><RoadmapGraphView {...props} /></GraphBoundary>; }
