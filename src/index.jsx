import * as React from 'react';
import jsonData from './input.json';
import ReactDOM from 'react-dom/client';

/* Plan :
Parent component = Agreement
In each other object, we have title, type, adn children. Type denotes the component types (h1, block, p, mention, text, clause, ul, li, h4, lic...).
The component types that I don't know are block, mention, text ,clause, and lic, so these will be new components.
Also in the heading we have various other info like styling.
In the final part we have text.

Children components = 
    Blocks, clauses, mentions, lic, and text.

We want to map through the input.json structure. Each time we check the type and add in the relevant styling, then continue through until all partsa re mapped.
We also want to create necessary children and render them when finished.

We will probably pass in children inside wahtever element/component we are creating, and the rest of the info is immediately applciable.

Other info :
    clauses can be kept track of using useRef as it doesn't explicitly change the view or trigger re-renders, increment the counter each time it's called to maintain the numbering system.
    Mentions should take in their data as a prop, then use that to render the component. They need to re-render on changing one with the associated ID.
    As a result, they should defniitely useState to keep track of data, so maybe an object of id : content pairs for all the mentions.
    Clauses have no styling, mentions only have colour styling.
*/
const data = jsonData;
const initialMentions = {}
const extractMentions = (items) => {  // pre-process the mentions so we don't have to re-render inside backtracking funciton.
    if (Array.isArray(items)) {
      items.forEach(item => extractMentions(item));
    } else if (items.type === "mention") {
        initialMentions[items.title] = items.children[0].text;
    } else if (items.children) {
      extractMentions(items.children);
    }
  };

extractMentions(data[0]);

function Mention({marks,mentions,id,color}){
    return(
        <span style={{fontWeight:marks.fontWeight, fontStyle:marks.fontStyle, textDecoration:marks.textDecoration, backgroundColor:color}}>{mentions[id]}</span>
    )
};

function Clause({marks,index,children}){
    return(
        // cuz of backtracking we've got the children, so we just need the first bullet point and styling.
        <div style={{display:'flex', alignItems:'baseline', fontWeight:marks.fontWeight, fontStyle:marks.fontStyle, textDecoration:marks.textDecoration}}>
            <span><pre>{index} </pre></span> 
            <div style={{flex:1}}> {children}</div>
        </div>  
        // used flexbox to align the bullet points w the text here. Wanted to use useRef for the optional part of the test, but couldn't figure out how to include it in the next tag.
    )
}

export default function Agreement(){
    // function should map through all of the objects.
    // Create a variable to hold all of the styles, then add them to the relevant elements.
    // Check for type, add to relevant component/element, recursively call function on the children if there are any
    // Also, add in props for styling and other relevant info.
    // Base case is when there are no children (text exists as a key in the object), then we just render the text with styling.
    
    // decalare ref to keep track of clauses
    const clauseIndex = React.useRef(0); // start at 0, increment before each Clause call, so first clause is 1.
    // Not really sure if this is what was intended, but I used this for the optional part
    const [mentions,setMentions] = React.useState(initialMentions) // initial state is empty object. Will be filled over time.
    // setMentions isn't used in the code, but in accordance with the description, updating the "mentions" object (however that is chosen to be implemented) should trigger a re-render, replacing all necessary parts.

    const backtrack = (items) => {
        if (Array.isArray(items)) { // if item is an array (inside the children element or initial element) go thru each object and call.
            return items.map((item) => backtrack(item));
        }
        const marks = {   // object that'll hold the optional marks. Check if they're true, then add them to the style.
            fontWeight: items.bold ? 'bold' : 'normal',
            fontStyle: items.italic ? 'italic' : 'normal',
            textDecoration: items.underline ? 'underline' : 'none',
        };
        if (!("type" in items)) { // the base case, should stop here.
            // split text on newline char to find the \n's.
            const textParts = items.text.split('\n').map((part, index, array) => (
              <React.Fragment key={index}>
                {part}
                {index < array.length - 1 && <br />}
              </React.Fragment>
            ));
        
            return (
              <span key={items.title || 'p-' + Math.random()} style={{ fontWeight: marks.fontWeight, fontStyle: marks.fontStyle, textDecoration: marks.textDecoration }}>
                {textParts}
              </span> // not too sure on span tags because in some cases they might appear nested which is unnecessary, but not sure how else to do.
            );
        }
        else if (items.type === "mention"){  // pass state as prop for potential future re-rendering.
            return <Mention key={items.title || 'p-' + Math.random()} marks={marks} mentions={mentions} color={items.color} id={items.title}/> 
            // shouldnt need other styling (marks), no other besides colour in the json, but just in case.
        }
        else if (items.type === "clause"){
            clauseIndex.current += 1;   // increment clause index ref.
            return <Clause key={items.title || 'p-' + Math.random()} marks={marks} index={clauseIndex.current}>{items.children && backtrack(items.children)}</Clause>
        }

        // had some issues with nested <p> tags here, so replacing all non-leaf <p> tags with <div> tags.
        // also replacing leaf <p> tags with <span> tags to avoid unnecessary newlining.
        else if (items.type === "p") { 
            if ("children" in items){
                return (
                    <div key={items.title || 'p-' + Math.random()}>
                        {items.children && backtrack(items.children)}
                    </div>
                );
            }
            else{
                return (
                    <span key={items.title || 'p-' + Math.random()}>
                        {items.text}
                    </span>
                )
            }
          }
        else{ // if not one of the above, create the relevant tag. Change "lic" to "span" and "block" to "div"
            const Tag = items.type === 'lic' ? 'span' : (items.type === 'block' ? 'div' : items.type); // Replace 'lic' with 'span', and 'block' with 'div'
            return (
            <Tag  key={items.title || 'p-' + Math.random()} style={{fontWeight: marks.fontWeight, fontStyle: marks.fontStyle, textDecoration: marks.textDecoration}}>
                {items.children && backtrack(items.children)}
            </Tag>
            );
        }
        
    }
    
    return <main className="agreement">{backtrack(data[0])}</main>;
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(<Agreement/>);