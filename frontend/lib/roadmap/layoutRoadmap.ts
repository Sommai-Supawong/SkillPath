import dagre from "@dagrejs/dagre";
import { Edge, MarkerType, Node } from "@xyflow/react";
import { RoadmapGraph, RoadmapGraphNode } from "@/lib/types";

export type RoadmapFlowNode = Node<RoadmapGraphNode & { direction: "LR" | "TB" }, "skill">;

const NODE_WIDTH = 264;
const NODE_HEIGHT = 224;

export function layoutRoadmap(graph: RoadmapGraph, direction: "LR" | "TB") {
  const layout = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  layout.setGraph({ rankdir: direction, ranksep: direction === "TB" ? 72 : 100, nodesep: 38, marginx: 30, marginy: 30 });

  for (const node of graph.nodes) layout.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT, order: node.order });
  for (const edge of graph.edges) layout.setEdge(edge.source, edge.target);
  dagre.layout(layout);

  const nodes: RoadmapFlowNode[] = [...graph.nodes].sort((a,b) => a.order - b.order).map((node) => {
    const position = layout.node(node.id);
    return {
      id: node.id,
      type: "skill",
      position: { x: position.x - NODE_WIDTH / 2, y: position.y - NODE_HEIGHT / 2 },
      data: { ...node, direction },
      focusable: true,
      ariaLabel: `${node.name}, ${node.status}, current level ${node.current_level}, target level ${node.target_level}`,
    };
  });
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const edges: Edge[] = graph.edges.map((edge) => {
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);
    const active = source?.status === "completed" && target?.status === "current";
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      className: active ? "roadmap-edge active" : "roadmap-edge",
      ariaLabel: `${source?.name ?? "Skill"} is a prerequisite for ${target?.name ?? "skill"}`,
    };
  });
  return { nodes, edges };
}
