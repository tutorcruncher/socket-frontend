import React from 'react'
import {IfElse, If, Markdown} from '../shared/Tools'

const filter_qual_levels = skills => {
  if (skills.length <= 5) {
    return skills
  } else {
    return skills.slice(0, 2).concat(['...']).concat(skills.slice(-2))
  }
}

const ConDetails = ({contractor, contractor_extra, get_text}) => (
  <div className="con-details">
    <Markdown content={contractor.primary_description}/>

    {contractor_extra && contractor_extra.extra_attributes.map((attr, i) => (
      <div key={i} className="tcs-attr">
        <h3>{attr.name}</h3>
        <IfElse v={attr.type === 'text_short' || attr.type === 'text_extended'}>
          <Markdown content={attr.value}/>
        {/*else*/}
          <p>{attr.value}</p>
        </IfElse>
      </div>
    ))}
    <If v={contractor_extra && contractor_extra.skills}>
      <table className="tcs-skills">
        <caption>
          <h3>{get_text('skills_label')}</h3>
        </caption>
        <tbody>
          {contractor_extra && contractor_extra.skills.map((skill, i) => (
            <tr key={i}>
              <th scope="row">{skill.subject}</th>
              <td>
                {filter_qual_levels(skill.qual_levels).map((qual_level, i) => (
                  <span key={i}>
                    {qual_level}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </If>
  </div>
)

export default ConDetails
