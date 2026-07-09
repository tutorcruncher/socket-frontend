import { useConfig } from '@/config/context'
import type { Contractor, Skill } from '@/api/types'
import { Markdown } from '@/components/ui/Markdown'

/** Truncate long qualification-level lists the way the legacy app did. */
function filterQualLevels(levels: string[]): string[] {
  if (levels.length <= 5) return levels
  return levels.slice(0, 2).concat(['…']).concat(levels.slice(-2))
}

export function ContractorDetails({ contractor }: { contractor: Contractor }) {
  const config = useConfig()
  return (
    <div className="tw:flex tw:flex-col tw:gap-4">
      <Markdown content={contractor.primary_description} />

      {contractor.extra_attributes?.length > 0 && (
        <div className="tw:flex tw:flex-col tw:gap-3">
          {contractor.extra_attributes.map((attr, i) => (
            <div key={i}>
              <h3 className="tw:text-base tw:font-medium tw:font-heading tw:mb-1">{attr.name}</h3>
              {attr.type === 'text_short' || attr.type === 'text_extended' ? (
                <Markdown content={attr.value} />
              ) : (
                <p className="tw:text-sm">{attr.value}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {contractor.skills?.length > 0 && (
        <div>
          <h3 className="tw:text-base tw:font-medium tw:font-heading tw:mb-2">
            {config.get_text('skills_label')}
          </h3>
          <div className="tw:border tw:border-default tw:rounded-lg tw:overflow-hidden">
            <table className="tw:w-full tw:text-sm">
              <tbody className="tw:divide-y tw:divide-default">
                {contractor.skills.map((skill: Skill, i) => (
                  <tr key={i} className="tw:align-top">
                    <th
                      scope="row"
                      className="tw:text-left tw:font-medium tw:px-3 tw:py-2 tw:bg-content tw:w-1/3"
                    >
                      {skill.subject}
                    </th>
                    <td className="tw:px-3 tw:py-2">
                      <div className="tw:flex tw:flex-wrap tw:gap-1">
                        {filterQualLevels(skill.qual_levels).map((q, j) => (
                          <span
                            key={j}
                            className="tw:inline-flex tw:items-center tw:rounded-full tw:bg-hover tw:px-2 tw:py-0.5 tw:text-xs tw:text-muted-dark"
                          >
                            {q}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
