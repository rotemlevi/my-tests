(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{8312:function(e,t,r){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return r(6209)}])},6209:function(e,t,r){"use strict";r.r(t);var n=r(5893),o=r(7294),i=r(7066),s=r(1955),l=r(2568),a=r.n(l);t.default=()=>{var e,t;let[r,l]=(0,o.useState)(s.Z.get("quizState")||Date.now().toString()),[d,c]=(0,o.useState)([]),[u,p]=(0,o.useState)([]),[x,h]=(0,o.useState)(0),[g,b]=(0,o.useState)(0),[f,m]=(0,o.useState)(0),[w,S]=(0,o.useState)(!1),[j,y]=(0,o.useState)([]),[C,k]=(0,o.useState)(!1),[v,F]=(0,o.useState)(0),[q,_]=(0,o.useState)(0),[A,R]=(0,o.useState)([]),[T,E]=(0,o.useState)("");(0,o.useEffect)(()=>{let e=s.Z.get("quizState");if(e){let t=sessionStorage.getItem(e);if(t){let e=JSON.parse(function(e){let t=atob(e),r=new Uint8Array(t.length);for(let e=0;e<t.length;e++)r[e]=t.charCodeAt(e);return new TextDecoder().decode(r)}(t));l(e.testId),h(e.currentQuestionIndex),c(e.questions),p(e.answers),R(e.questionTimes),k(e.testStarted),_(e.startTime),b(e.initialTime),m(e.elapsedTime),E(e.stateHash)}else N()}else N()},[]),(0,o.useEffect)(()=>{if(C){let e=setInterval(()=>{let e=Math.floor((Date.now()-q)/1e3);m(e),e>=g&&O()},1e3);return()=>clearInterval(e)}},[C,q,g]),(0,o.useEffect)(()=>{C&&I()},[r,x,d,u,A,C,q,g,f]);let N=async()=>{try{let e=(await i.Z.get("".concat("/my-tests","/questions.json"))).data.filter(e=>!e.complaints||e.complaints<=1);e=z(e),c(e),p(Array(e.length).fill(null)),R(Array(e.length).fill(0)),b(60*e.length)}catch(e){console.error("Failed to load questions:",e)}},z=e=>{for(let t=e.length-1;t>0;t--){let r=Math.floor(Math.random()*(t+1));[e[t],e[r]]=[e[r],e[t]]}return e},D=e=>{let{testId:t,questions:r,answers:n,currentQuestionIndex:o,testStarted:i,questionTimes:s,showResults:l,results:d,score:c}=e;return a()(JSON.stringify({testId:t,questions:r,answers:n,currentQuestionIndex:o,testStarted:i,questionTimes:s,showResults:l,results:d,score:c}))},I=()=>{let e={testId:r,currentQuestionIndex:x,questions:d,answers:u,questionTimes:A,testStarted:C,startTime:q,initialTime:g,elapsedTime:f,stateHash:T},t=D(e);if(T!==t){E(t),e.stateHash=t;let n=function(e){let t=new TextEncoder().encode(e),r="";for(let e=0;e<t.length;e++)r+=String.fromCharCode(t[e]);return btoa(r)}(JSON.stringify(e));sessionStorage.setItem(r,n)}},Z=async()=>{await N();let e=Date.now().toString();l(e),_(Date.now()),k(!0),m(0),s.Z.set("quizState",e,{expires:1}),I()},O=()=>{let e=d.map((e,t)=>{let r=u[t],n=r===e.correctAnswer;return{question:e.question,correct:e.correctAnswer,userAnswer:r,isCorrect:n,timeTaken:A[t]}});y(e),F(e.filter(e=>e.isCorrect).length),S(!0),s.Z.remove("quizState"),sessionStorage.removeItem(r)},M=()=>{let e=Date.now();R(t=>{let r=[...t];return r[x]=(e-q)/6e4,r}),_(e),x<d.length-1&&h(x+1)},J=e=>{let t=[...u];t[x]=e,p(t),I()},L=async()=>{s.Z.remove("quizState"),S(!1),h(0),k(!1),p([]),F(0),m(0),R([]),l(Date.now().toString()),await N()},B=g-f;return(0,n.jsx)("div",{style:{padding:"20px",fontFamily:"Arial, sans-serif"},children:w?(0,n.jsxs)("div",{children:[(0,n.jsx)("h2",{style:{color:"#4CAF50"},children:"תוצאות:"}),j.map((e,t)=>(0,n.jsxs)("div",{style:{backgroundColor:e.isCorrect?"#d4edda":"#f8d7da",padding:"20px",marginBottom:"10px",borderRadius:"5px"},children:[(0,n.jsx)("p",{children:e.question}),(0,n.jsxs)("p",{children:["התשובה שלך: ",d[t].options[e.userAnswer]]}),(0,n.jsxs)("p",{children:["התשובה הנכונה: ",d[t].options[e.correct]]}),(0,n.jsx)("p",{children:e.isCorrect?"נכון":"לא נכון"}),(0,n.jsxs)("p",{children:["זמן שלקח לענות: ",e.timeTaken.toFixed(2)," דקות"]})]},t)),(0,n.jsxs)("h3",{style:{color:"#FF5733"},children:["ניקוד סופי: ",v," מתוך ",d.length]}),(0,n.jsx)("button",{onClick:L,style:{padding:"10px 20px",backgroundColor:"#4CAF50",color:"white",border:"none",borderRadius:"5px",cursor:"pointer"},children:"חזור"})]}):(0,n.jsx)(n.Fragment,{children:C?(0,n.jsxs)("div",{children:[(0,n.jsx)("div",{children:(0,n.jsxs)("p",{style:{color:"#FF5733",fontSize:"18px"},children:["זמן שנותר: ",(e=>{let t=e%60;return"".concat(Math.floor(e/60),":").concat(t<10?"0":"").concat(t)})(B)]})}),(0,n.jsxs)("div",{style:{backgroundColor:"#f9f9f9",padding:"20px",borderRadius:"5px",boxShadow:"0 0 10px rgba(0,0,0,0.1)"},children:[(0,n.jsxs)("p",{style:{fontSize:"18px"},children:["שאלה ",x+1,": ",null===(e=d[x])||void 0===e?void 0:e.question]}),null===(t=d[x])||void 0===t?void 0:t.options.map((e,t)=>(0,n.jsxs)("div",{style:{marginBottom:"10px"},children:[(0,n.jsx)("input",{type:"radio",name:"question-".concat(x),value:t,checked:u[x]===t,onChange:()=>J(t),style:{marginRight:"10px"}}),(0,n.jsx)("label",{children:e})]},t))]}),(0,n.jsxs)("div",{style:{marginTop:"20px"},children:[(0,n.jsx)("button",{onClick:()=>{x>0&&h(x-1)},disabled:x<1,style:{padding:"10px 20px",backgroundColor:x<1?"#b0c4de":"#2196F3",color:"white",border:"none",borderRadius:"5px",cursor:x<1?"not-allowed":"pointer",marginRight:"10px"},children:"הקודם"}),(0,n.jsx)("button",{onClick:M,disabled:x>=d.length-1,style:{padding:"10px 20px",backgroundColor:x>=d.length-1?"#b0c4de":"#2196F3",color:"white",border:"none",borderRadius:"5px",cursor:x>=d.length-1?"not-allowed":"pointer"},children:"הבא"}),(0,n.jsx)("button",{onClick:O,disabled:x!==d.length-1,style:{padding:"10px 20px",backgroundColor:x>=d.length-1?"#FF5733":"#b0c4de",color:"white",border:"none",borderRadius:"5px",cursor:"pointer",marginLeft:"10px"},children:"שלח"}),(0,n.jsx)("button",{disabled:!0,onClick:()=>{let e=[...d],t=e[x];t.complaints||(t.complaints=0),t.complaints++,c(e),I(),M()},style:{padding:"10px 20px",backgroundColor:"#FF5733",color:"white",border:"none",borderRadius:"5px",cursor:"pointer",marginLeft:"10px"},children:"דווח על שאלה"}),(0,n.jsx)("button",{onClick:L,style:{padding:"10px 20px",backgroundColor:"#f44336",color:"white",border:"none",borderRadius:"5px",cursor:"pointer",marginLeft:"10px"},children:"התחל מבחן חדש"})]})]}):(0,n.jsx)("div",{children:(0,n.jsx)("button",{onClick:Z,style:{padding:"10px 20px",backgroundColor:"#4CAF50",color:"white",border:"none",borderRadius:"5px",cursor:"pointer"},children:"התחל מבחן"})})})})}}},function(e){e.O(0,[672,888,774,179],function(){return e(e.s=8312)}),_N_E=e.O()}]);