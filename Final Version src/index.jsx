import * as React from 'react';
import data from './input2.json';
import ReactDOM from 'react-dom/client';

/* Changes : 
    1. Don't need clauseIndex ref because no internal re-rendering during backtracking, can just use a "let" var.
    2. Added the colour to the mentions object, render colour from that object as well.
    3. Started adding functionality for bullet points per layer, but hard to do as final bullet point is a layer above the first two...
    4. Removed the "Clause" component as it was unnecessary and contents could be inlined.
    5. Added functionality for updating the mentions object text/colour with user input
    6. Added marks into the backtracking function so that parent marks propagate to children.

     . Created an input2.json file to test "Clause" when bullets are properly aligned and for parent component styling.
     . Specifically, removed <p> parent of final "clause" and added bold styling to title.
     . Remove "flex: 1" styling as it is the default.
     . Changed unique key names to be more specific and accurate.
     . imported input.json as data instead of jsonData
     
*/

// PRE-PROCESSING MENTIONS
const initialMentions = {}
const extractMentions = (items) => {
    if (Array.isArray(items)) {
      items.forEach(item => extractMentions(item));
    } else if (items.type === "mention") {
        initialMentions[items.title] = {text : items.children[0].text, color : items.color,};
    } else if (items.children) {
      extractMentions(items.children);
    }
};
extractMentions(data[0]);

// INITIAL MARKS OBJECT
const defaultMarks = {
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
};

// BULLET POINT OBJECT TO MATCH DOC
const clause = {
    1 : {
        1 : "1. ",
        2 : "2. ",
        3: "3. ",
    },
    2 : {
        1 : "(a) ",
        2 : "(b) ",
        3 : "(c) ",
    },
};

// MENTION COMPONENT BASED ON MENTIONS STATE
function Mention({marks,mentions,id,handleEnter}){
    return(
        <span style={{fontWeight:marks.fontWeight, fontStyle:marks.fontStyle, textDecoration:marks.textDecoration, backgroundColor:mentions[id].color}}>
            {<input style={{backgroundColor:mentions[id].color}}onKeyDown={(e)=>handleEnter(e,id)} placeholder={mentions[id].text}></input>}
            {/* {mentions[id].text} */}
        </span>
    )
};

export default function Agreement(){  
    let clauseIndex = 0;
    const [mentions,setMentions] = React.useState(initialMentions);
    
    // ON ENTER FOR MENTIONS UPDATING
    const handleEnter = (e,id) => {
        if (e.key === 'Enter'){
            const inputParts = e.target.value.split(':').map(part => part.trim());
            const newText = inputParts[0];
            const newColor = inputParts.length > 1 ? inputParts[1] : mentions[id].color;
            setMentions({ 
                ...mentions, 
                [id]: {
                    ...mentions[id], 
                    text: newText, 
                    color: newColor
                }
            });
            e.target.value = "";
        }
    }

    // BACKTRACKING FUNCTION -> TRACK CLAUSE INDEX AND MARKS
    const backtrack = (items,clauseLayer,clauseNumber,parentMarks) => {
        const marks = {...parentMarks};
        let clauseTracker = 0;

        // ITERATE THROUGH ARRAY ITEMS (CHILDREN), INCREMENT CLAUSE INDEX IF NECESSARY
        if (Array.isArray(items)) {
            return items.map((item) => {
                if ("type" in item && item.type==="clause") {
                    clauseTracker += 1;
                }
                return backtrack(item,clauseLayer,clauseTracker,marks);
            });
        }

        // UPDATE MARKS
        if (items.bold === true){
            marks.fontWeight = 'bold';
        }
        if (items.italic === true){
            marks.fontStyle = 'italic';
        }
        if (items.underline === true){
            marks.textDecoration = 'underline';
        }
        
        // BASE CASE, CREATE TEXT WITH STYLING
        if (!("type" in items)) {
            const textParts = items.text.split('\n').map((part, index, array) => (
              <React.Fragment key={index}>
                {part}
                {index < array.length - 1 && <br />}
              </React.Fragment>
            ));
            return (
              <span key={items.title || 'text-' + Math.random()} style={{ fontWeight: marks.fontWeight, fontStyle: marks.fontStyle, textDecoration: marks.textDecoration }}>
                {textParts}
              </span>
            );
        }

        // <MENTIONS>
        else if (items.type === "mention"){ 
            return <Mention key={items.title || 'mention-' + Math.random()} marks={marks} mentions={mentions} id={items.title} handleEnter={handleEnter}/> 
        }

        // CLAUSE, INCREMENT CLAUSE INDEX
        else if (items.type === "clause"){
            clauseIndex += 1;
            return (
                <div key={items.title || 'clause-' + Math.random()} style={{display:'flex', alignItems:'baseline', fontWeight:marks.fontWeight, fontStyle:marks.fontStyle, textDecoration:marks.textDecoration}}>
                    <span><pre>{clauseIndex} {clause[clauseLayer][clauseNumber]}</pre></span> 
                    <div> {items.children && backtrack(items.children,clauseLayer+1,clauseNumber,marks)}</div> 
                </div>
            )
        }

        // CHANGE ALL P TAGS FOR FORMATTING -- DIV IF PARENT, SPAN IF NOT
        else if (items.type === "p") { 
            if ("children" in items){
                return (
                    <div key={items.title || 'pdiv-' + Math.random()}>
                        {items.children && backtrack(items.children,clauseLayer,clauseNumber,marks)}
                    </div>
                );
            }
            else{
                return (
                    <span key={items.title || 'pspan-' + Math.random()}>
                        {items.text}
                    </span>
                )
            }
        }
        
        // CREATE OTHER TAGS, CHANGE LIC->SPAN AND BLOCK->DIV
        else{
            const Tag = items.type === 'lic' ? 'span' : (items.type === 'block' ? 'div' : items.type);
            return (
                <Tag key={items.title || 'default-' + Math.random()} style={{fontWeight: marks.fontWeight, fontStyle: marks.fontStyle, textDecoration: marks.textDecoration}}>
                    {items.children && backtrack(items.children,clauseLayer,clauseNumber,marks)}
                </Tag>
            );
        }
        
    }
    return <main className="agreement">{backtrack(data[0],1,1,defaultMarks)}</main>;
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(<Agreement/>);