import{r as C,j as e,u as q}from"./common-vendor-Dm1O5F_f.js";import{u as P,d as V}from"./index-D_kUnxVd.js";import{r as R,f as B}from"./firebase-vendor-DMyrRdrZ.js";import{C as F,a as I,b as O,d as E}from"./card-LNUWDAdH.js";import{c as H,d as k,T as D,a as c,e as $,b as o}from"./table-BlATw8c5.js";import{I as U}from"./input-B4qfIMTe.js";const v=({options:f,value:a,onValueChange:r,placeholder:d,allOptionLabel:j})=>{const[b,s]=C.useState(""),[t,i]=C.useState(!1);C.useEffect(()=>{s(a==="all"?"":a)},[a]);const S=f.filter(l=>l.toLowerCase().includes(b.toLowerCase())),y=l=>{const g=l.target.value;s(g),i(g.length>0&&S.length>0)},h=l=>{r(l),i(!1)};return C.useEffect(()=>{const l=g=>{g.target.closest(".searchable-select")||i(!1)};return document.addEventListener("mousedown",l),()=>{document.removeEventListener("mousedown",l)}},[]),e.jsxs("div",{className:"relative w-64 searchable-select",children:[e.jsx(U,{type:"text",placeholder:d,value:b,onChange:y,className:"w-full"}),t&&S.length>0&&e.jsx("div",{className:"absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto",children:e.jsxs("div",{className:"py-1",children:[b.length>0&&e.jsx("div",{className:"px-4 py-2 hover:bg-gray-100 cursor-pointer",onClick:()=>h("all"),children:j}),S.map(l=>e.jsx("div",{className:"px-4 py-2 hover:bg-gray-100 cursor-pointer",onClick:()=>h(l),children:l},l))]})})]})},z=({data:f,filters:a,filterOptions:r,onFilterChange:d})=>{const j=f.filter(s=>{var h,l;const t=a.campCode==="all"||s.campCode===a.campCode,i=a.clinicCode==="all"||s.clinicCode===a.clinicCode,S=a.date==="all"||s.date===a.date,y=a.status==="all"||((h=s.status)==null?void 0:h.toLowerCase())===((l=a.status)==null?void 0:l.toLowerCase());return t&&i&&S&&y}),b=s=>({completed:"bg-green-100 text-green-800",pending:"bg-yellow-100 text-yellow-800",active:"bg-blue-100 text-blue-800",cancelled:"bg-red-100 text-red-800"})[s==null?void 0:s.toLowerCase()]||"bg-gray-100 text-gray-800";return e.jsxs(F,{className:"mb-6",children:[e.jsxs(I,{children:[e.jsx(O,{children:"Health Camp Records"}),e.jsxs("div",{className:"flex flex-wrap gap-4 mt-4",children:[e.jsx(v,{options:r.campCodes,value:a.campCode,onValueChange:s=>d("campCode",s),placeholder:"Filter by Camp Code",allOptionLabel:"All Camp Codes"}),e.jsx(v,{options:r.clinicCodes,value:a.clinicCode,onValueChange:s=>d("clinicCode",s),placeholder:"Filter by Clinic Code",allOptionLabel:"All Clinic Codes"}),e.jsx(v,{options:r.dates,value:a.date,onValueChange:s=>d("date",s),placeholder:"Filter by Date",allOptionLabel:"All Dates"}),e.jsx(v,{options:r.statuses,value:a.status,onValueChange:s=>d("status",s),placeholder:"Filter by Status",allOptionLabel:"All Statuses"})]})]}),e.jsx(E,{children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(H,{children:[e.jsx(k,{children:e.jsxs(D,{children:[e.jsx(c,{children:"Camp Code"}),e.jsx(c,{children:"Clinic Code"}),e.jsx(c,{children:"Date"}),e.jsx(c,{className:"text-right",children:"Tests Sold"}),e.jsx(c,{children:"Status"})]})}),e.jsx($,{children:j.length===0?e.jsx(D,{children:e.jsx(o,{colSpan:5,className:"text-center py-10",children:"No records found"})}):j.map(s=>e.jsxs(D,{className:"hover:bg-gray-50",children:[e.jsx(o,{children:s.campCode}),e.jsx(o,{children:s.clinicCode}),e.jsx(o,{children:s.date}),e.jsx(o,{className:"text-right",children:s.unitsSold}),e.jsx(o,{children:e.jsx("span",{className:`px-2 py-1 rounded-full text-xs font-medium 
                        ${b(s.status)}`,children:s.status})})]},s.id))})]})})})]})},M=({data:f,filters:a,filterOptions:r,onFilterChange:d})=>{const j=f.filter(t=>{var g,L,p,x,u;const i=a.testCode==="all"||t.testCode===a.testCode,S=a.testName==="all"||t.testName===a.testName,y=a.submittedAt==="all"||new Date((g=t.submitter)==null?void 0:g.submittedAt).toLocaleDateString()===a.submittedAt,h=a.reportStatus==="all"||((L=t.reportStatus)==null?void 0:L.toLowerCase())===((p=a.reportStatus)==null?void 0:p.toLowerCase()),l=a.vendorStatus==="all"||((x=t.vendorStatus)==null?void 0:x.toLowerCase())===((u=a.vendorStatus)==null?void 0:u.toLowerCase());return i&&S&&y&&h&&l}),b=t=>t?new Date(t).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"-",s=t=>({submitted:"bg-blue-100 text-blue-800",completed:"bg-green-100 text-green-800",pending:"bg-yellow-100 text-yellow-800",active:"bg-purple-100 text-purple-800"})[t==null?void 0:t.toLowerCase()]||"bg-gray-100 text-gray-800";return e.jsxs(F,{children:[e.jsxs(I,{children:[e.jsx(O,{children:"Individual Test Records"}),e.jsxs("div",{className:"flex flex-wrap gap-4 mt-4",children:[e.jsx(v,{options:r.testCodes,value:a.testCode,onValueChange:t=>d("testCode",t),placeholder:"Filter by Test Code",allOptionLabel:"All Test Codes"}),e.jsx(v,{options:r.testNames,value:a.testName,onValueChange:t=>d("testName",t),placeholder:"Filter by Test Name",allOptionLabel:"All Test Names"}),e.jsx(v,{options:r.submittedDates,value:a.submittedAt,onValueChange:t=>d("submittedAt",t),placeholder:"Filter by Date",allOptionLabel:"All Dates"}),e.jsx(v,{options:r.reportStatuses,value:a.reportStatus,onValueChange:t=>d("reportStatus",t),placeholder:"Filter by Report Status",allOptionLabel:"Report Status"}),e.jsx(v,{options:r.vendorStatuses,value:a.vendorStatus,onValueChange:t=>d("vendorStatus",t),placeholder:"Filter by Vendor Status",allOptionLabel:"Vendor Status"})]})]}),e.jsx(E,{children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(H,{children:[e.jsx(k,{children:e.jsxs(D,{children:[e.jsx(c,{children:"Test Code"}),e.jsx(c,{children:"Booking ID"}),e.jsx(c,{children:"Patient Name"}),e.jsx(c,{children:"Test Name"}),e.jsx(c,{children:"Submitted At"}),e.jsx(c,{children:"Report Status"}),e.jsx(c,{children:"Vendor Status"}),e.jsx(c,{children:"Payment Status"})]})}),e.jsx($,{children:j.length===0?e.jsx(D,{children:e.jsx(o,{colSpan:8,className:"text-center py-10",children:"No records found"})}):j.map(t=>{var i;return e.jsxs(D,{className:"hover:bg-gray-50",children:[e.jsx(o,{className:"font-medium",children:t.testCode}),e.jsx(o,{children:t.bookingId}),e.jsx(o,{children:e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:t.name}),e.jsxs("div",{className:"text-sm text-gray-500",children:[t.age," yrs, ",t.gender]})]})}),e.jsx(o,{children:t.testName}),e.jsx(o,{children:b((i=t.submitter)==null?void 0:i.submittedAt)}),e.jsx(o,{children:e.jsx("span",{className:`px-2 py-1 rounded-full text-xs font-medium 
                        ${s(t.reportStatus)}`,children:t.reportStatus})}),e.jsx(o,{children:e.jsx("span",{className:`px-2 py-1 rounded-full text-xs font-medium 
                        ${s(t.vendorStatus)}`,children:t.vendorStatus})}),e.jsx(o,{children:e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsx("span",{className:`px-2 py-1 rounded-full text-xs font-medium 
                          ${s(t.paymentStatus)}`,children:t.paymentStatus}),e.jsxs("span",{className:"text-xs text-gray-500",children:[t.paymentMode," • ₹",t.price]})]})})]},t.id)})})]})})})]})},Y=()=>{const{currentUser:f,userRole:a,logout:r}=P();q();const[d,j]=C.useState([]),[b,s]=C.useState([]),[t,i]=C.useState({campCode:"all",clinicCode:"all",date:"all",status:"all"}),[S,y]=C.useState({testCode:"all",testName:"all",submittedAt:"all",reportStatus:"all",vendorStatus:"all"}),[h,l]=C.useState({campCodes:[],clinicCodes:[],dates:[],statuses:[],testCodes:[],testNames:[],submittedDates:[],reportStatuses:[],vendorStatuses:[]});C.useEffect(()=>{if(a==="health-camp-admin"||a==="superadmin"){const p=R(V,"healthCamps");B(p,x=>{const u=x.val();if(u){const m=Object.entries(u).map(([w,n])=>({id:w,...n}));j(m);const T=[...new Set(m.map(w=>w.status).filter(Boolean))].sort();l(w=>({...w,campCodes:[...new Set(m.map(n=>n.campCode).filter(Boolean))].sort(),clinicCodes:[...new Set(m.map(n=>n.clinicCode).filter(Boolean))].sort(),dates:[...new Set(m.map(n=>n.date).filter(Boolean))].sort(),statuses:T}))}})}if(a==="health-camp-admin"||a==="individual-camp-admin"||a==="superadmin"){const p=R(V,"testEntries");B(p,x=>{const u=x.val();if(u){const m=Object.entries(u).map(([n,N])=>({id:n,...N}));s(m);const T=[...new Set(m.map(n=>n.reportStatus).filter(Boolean))].sort(),w=[...new Set(m.map(n=>n.vendorStatus).filter(Boolean))].sort();l(n=>({...n,testCodes:[...new Set(m.map(N=>N.testCode).filter(Boolean))].sort(),testNames:[...new Set(m.map(N=>N.testName).filter(Boolean))].sort(),submittedDates:[...new Set(m.map(N=>{var A;return(A=N.submitter)!=null&&A.submittedAt?new Date(N.submitter.submittedAt).toLocaleDateString():""}).filter(Boolean))].sort(),reportStatuses:T,vendorStatuses:w}))}})}},[a]);const g=(p,x)=>{i(u=>({...u,[p]:x}))},L=(p,x)=>{y(u=>({...u,[p]:x}))};return e.jsx("div",{className:"min-h-screen bg-gray-100",children:e.jsx("div",{className:"max-w-12xl",children:e.jsxs("div",{className:"px-4 py-6 sm:px-0",children:[(a==="health-camp-admin"||a==="superadmin")&&e.jsx(z,{data:d,filters:t,filterOptions:h,onFilterChange:g}),(a==="health-camp-admin"||a==="individual-camp-admin"||a==="superadmin")&&e.jsx(M,{data:b,filters:S,filterOptions:h,onFilterChange:L})]})})})};export{Y as default};
