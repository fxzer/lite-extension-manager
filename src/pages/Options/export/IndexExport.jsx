import React from "react"
import { Outlet } from "react-router-dom"

import { getLang } from "../../../utils/utils.js"
import Title from "../Title.jsx"

const IndexExport = () => {
  return (
    <div>
      <Title title={getLang("management_export_title")}></Title>
      <Outlet />
    </div>
  )
}

export default IndexExport
