/**
 * @fileoverview shared/constants/skills.ts — Global static skill library.
 *
 * Skills are defined here as plain constants — no Firestore, no org dependency.
 * Any user account can hold any of these skills via SkillGrant.tagSlug.
 *
 * To add a new skill: append an entry to SKILLS.
 * The `slug` is the stable identifier used in SkillGrant.tagSlug and
 * SkillRequirement.tagSlug — never change an existing slug (it would
 * orphan existing grants stored in Firestore).
 */

export interface SkillDefinition {
  slug: string;
  name: string;
  category: SkillCategory;
  description?: string;
}

export type SkillCategory =
  | 'Civil'
  | 'Electrical'
  | 'Mechanical'
  | 'Finishing'
  | 'HeavyEquipment'
  | 'Safety'
  | 'Engineering'
  | 'Management';

// ---------------------------------------------------------------------------
// Canonical skill list — add entries here to extend the global library
// ---------------------------------------------------------------------------

export const SKILLS: readonly SkillDefinition[] = [
  // Civil / Structural
  { slug: 'concrete-work',      name: 'Concrete Work',       category: 'Civil',          description: 'Mixing, pouring and finishing concrete structures.' },
  { slug: 'rebar-installation', name: 'Rebar Installation',  category: 'Civil',          description: 'Cutting, bending and tying reinforcement steel.' },
  { slug: 'formwork',           name: 'Formwork',            category: 'Civil',          description: 'Assembly and stripping of concrete formwork systems.' },
  { slug: 'masonry',            name: 'Masonry',             category: 'Civil',          description: 'Block, brick and stone laying.' },
  { slug: 'waterproofing',      name: 'Waterproofing',       category: 'Civil',          description: 'Membrane application and drainage solutions.' },
  { slug: 'earthwork',          name: 'Earthwork',           category: 'Civil',          description: 'Excavation, grading and compaction operations.' },
  { slug: 'structural-steel',   name: 'Structural Steel',    category: 'Civil',          description: 'Erection and connection of steel frames and columns.' },

  // Electrical
  { slug: 'electrical-wiring',  name: 'Electrical Wiring',   category: 'Electrical',     description: 'Low-voltage wiring, conduit and cable installation.' },
  { slug: 'panel-installation', name: 'Panel Installation',  category: 'Electrical',     description: 'MCC and distribution board assembly and commissioning.' },
  { slug: 'lighting-installation', name: 'Lighting Installation', category: 'Electrical', description: 'Interior and exterior luminaire fitting and controls.' },

  // Mechanical / HVAC
  { slug: 'hvac-installation',  name: 'HVAC Installation',   category: 'Mechanical',     description: 'Air handling units, chillers and ductwork installation.' },
  { slug: 'plumbing',           name: 'Plumbing',            category: 'Mechanical',     description: 'Piping systems for water supply and drainage.' },
  { slug: 'fire-suppression',   name: 'Fire Suppression',    category: 'Mechanical',     description: 'Sprinkler, gaseous and foam suppression system installation.' },
  { slug: 'ventilation',        name: 'Ventilation',         category: 'Mechanical',     description: 'Exhaust fans, louvers and mechanical ventilation ducting.' },

  // Finishing
  { slug: 'plastering',         name: 'Plastering',          category: 'Finishing',      description: 'Interior and exterior rendering and plastering.' },
  { slug: 'tiling',             name: 'Tiling',              category: 'Finishing',      description: 'Ceramic, porcelain and stone tile installation.' },
  { slug: 'painting',           name: 'Painting',            category: 'Finishing',      description: 'Surface preparation, priming and finish coat application.' },
  { slug: 'flooring',           name: 'Flooring',            category: 'Finishing',      description: 'Timber, vinyl, epoxy and raised-access floor installation.' },
  { slug: 'glass-installation', name: 'Glass Installation',  category: 'Finishing',      description: 'Curtain wall, glazing and mirror fitting.' },

  // Heavy Equipment
  { slug: 'crane-operation',    name: 'Crane Operation',     category: 'HeavyEquipment', description: 'Tower crane and mobile crane lift planning and operation.' },
  { slug: 'excavator-operation',name: 'Excavator Operation', category: 'HeavyEquipment', description: 'Hydraulic excavator operation for trenching and grading.' },
  { slug: 'welding',            name: 'Welding',             category: 'HeavyEquipment', description: 'MIG, TIG and arc welding of structural and pipe joints.' },
  { slug: 'rigging',            name: 'Rigging',             category: 'HeavyEquipment', description: 'Slinging, shackling and load calculation for hoisting.' },

  // Safety
  { slug: 'safety-management',  name: 'Safety Management',   category: 'Safety',         description: 'HSE planning, toolbox talks and incident investigation.' },
  { slug: 'quality-inspection', name: 'Quality Inspection',  category: 'Safety',         description: 'NDT, dimensional checks and defect reporting.' },

  // Engineering / Survey
  { slug: 'surveying',          name: 'Surveying',           category: 'Engineering',    description: 'Total station and GPS setout, as-built verification.' },
  { slug: 'structural-design',  name: 'Structural Design',   category: 'Engineering',    description: 'Load analysis and structural member sizing.' },
  { slug: 'cad-drafting',       name: 'CAD Drafting',        category: 'Engineering',    description: 'AutoCAD / Revit 2D and 3D construction drawings.' },
  { slug: 'blueprint-reading',  name: 'Blueprint Reading',   category: 'Engineering',    description: 'Interpretation of architectural and structural drawings.' },

  // Management
  { slug: 'site-supervision',   name: 'Site Supervision',    category: 'Management',     description: 'Day-to-day coordination of subcontractors and labour.' },
  { slug: 'project-management', name: 'Project Management',  category: 'Management',     description: 'Programme planning, cost control and stakeholder reporting.' },
] as const;

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------

/** All valid skill slug strings — derived from SKILLS at compile time. */
export type SkillSlug = (typeof SKILLS)[number]['slug'];

/** O(1) lookup map: slug → SkillDefinition */
export const SKILL_BY_SLUG = new Map<string, SkillDefinition>(
  SKILLS.map(s => [s.slug, s])
);

/** Returns the SkillDefinition for a slug, or undefined if not found. */
export function findSkill(slug: string): SkillDefinition | undefined {
  return SKILL_BY_SLUG.get(slug);
}
