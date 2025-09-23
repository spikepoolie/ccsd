// Centralized drawer navigation items used by SideDrawer.
// Keep keys in sync with public/reports/*.json manifests.

const drawerItems = [
  {
    id: 1,
    key: 'custody-services-bureau',
    label: 'Custody Services Bureau',
    children: [
      { key: 'mdf-bookings', label: '# MDF Bookings' },
      { key: 'custody-alternative-bookings', label: '# Custody Alternative Bookings' },
    ],
  },
  { id: 2, key: 'arrests-bookings-census', label: 'Persons Arrested/Booked & Census Data' },
  { id: 3, key: 'felony-race-percentage', label: 'Prior Felony by Race & % of Jail Pop.' },
  { id: 4, key: 'custody-alternative', label: 'Custody Alternative Facility' },
  { id: 5, key: 'operating-costs', label: 'FY 23/24 Operating Costs vs Detention' },
  {
    id: 6,
    key: 'custody-services-bureau',
    label: '# Custody Services Bureau',
    children: [
      { key: 'number-bookings-agency', label: 'Total Number of Bookings by Agency' },
      { key: 'bookings-by-gender', label: 'Bookings by Gender' },
      { key: 'average-daily-population', label: 'Average Daily Population' },
      { key: 'average-pre-post-trial', label: 'Average Pre and Post Trial Population' },
      { key: 'in-custody-deaths', label: 'In-Custody Deaths' },
      { key: 'norcan-deployments', label: 'Norcan Deployments' },
      { key: 'assaults-on-staff', label: 'Assaults on Staff' },
      { key: 'notification-received-results', label: 'Total Requests for Notification Received' },
      { key: 'notification-made-results', label: 'Total Requests for Notification Made' },
      { key: 'notification-same-person-results', label: 'Notificaion on the Same Person' },
      { key: 'net-notification', label: 'Net Notification Made' },
    ],
  },
  {
    id: 7,
    key: 'field-operation-bureau',
    label: 'Field Operation Bureau',
    children: [
      { key: 'total-dispatch-call-service', label: 'Total Number of Dispatch Calls for Service' },
      { key: 'total-office-sheriff', label: 'Total Office of the Sheriff Personnel' },
      { key: 'assaults-staff', label: 'Assaults on Staff' },
      { key: 'a3', label: 'A3 (Anyone, Anywhere, Anytime) Requests' },
      { key: 'a3-responses', label: 'A3 Responses' },
      { key: 'mental-health-evaluation', label: 'Mental Health Evaluation Team Deployments' },
      { key: 'welfare-institutions-code-5150', label: 'Total Welfare & Institutions Code 5150 Calls' },
      { key: 'non-violent-welfare', label: 'Non-Violent Welfare & Institutions Code 5150 Calls' },
      { key: 'violent-welfare', label: 'Violent Welfare & Institutions Code 5150 Calls' },
      { key: 'writ-possession', label: 'Writ of Possession of Real Property with Tenant Removal' },
      { key: 'tenant-removal', label: 'Tenant Removal' },
    ],
  },
  {
    id: 8,
    key: 'support-bureau',
    label: 'Support Bureau',
    children: [
      { key: 'total-coroners-cases', label: 'Total Number of Coroners Cases' },
      { key: 'total-autopsies', label: 'Total Number of Autopsies' },
      { key: 'fentanyl-deaths', label: 'Total Number of Fentanul Related Deaths' },
      { key: 'suicide-deaths', label: 'Total Number of Suicide Deaths' },
    ],
  },
  {
    id: 9,
    key: 'administration-services-bureau',
    label: 'Administration Bureau',
    children: [
      { key: 'internal-affairs', label: 'Internal Affairs Investigations Initiated' },
      { key: 'use-of-force', label: 'Total Number of Use of Force Incidents reported to State DOJ*' },
      { key: 'number-ccw', label: 'Number of CCW Processed' },
    ],
  },
];

export default drawerItems;
