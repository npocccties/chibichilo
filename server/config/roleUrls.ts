/** 利用者と LTI v1.3 Roles Claim との対応関係	*/
const roleUrls = {
  /** 管理者 */
  administrator: [
    "http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator",
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator",
    "http://purl.imsglobal.org/vocab/lis/v2/person#Administrator", // moodle 4.0.2
  ],
  /** 教員 */
  instructor: [
    "http://purl.imsglobal.org/vocab/lis/v2/membership#ContentDeveloper",
    "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor",
  ],
} as const;

export default roleUrls;
