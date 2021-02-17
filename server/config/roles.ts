/** 利用者と LTI v1.1 ロールの完全修飾URNとの対応関係	*/
const roles = {
  /** 管理者 */
  administrator: [
    "urn:lti:sysrole:ims/lis/Administrator",
    "urn:lti:instrole:ims/lis/Administrator",
  ],
  /** 教員 */
  instructor: [
    "urn:lti:role:ims/lis/TeachingAssistant/Grader",
    "urn:lti:role:ims/lis/TeachingAssistant",
    "urn:lti:role:ims/lis/ContentDeveloper",
    "urn:lti:role:ims/lis/Instructor",
  ],
} as const;

export default roles;
