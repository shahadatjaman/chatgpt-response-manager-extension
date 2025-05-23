const favKey =  'fav_';
let previousTitle = document.title;

let storedArticels = JSON.parse(localStorage.getItem(favKey) || '[]');
let url = window.location.href;

const createButton = (text, onClick) => {
  const button = document.createElement('button');
  button.innerText = text;
  Object.assign(button.style, {
    display: 'inline-block',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'left',
    margin: '4px 8px 4px 0'
  });
  
  
  button.addEventListener('click', onClick);
  return button;
};

function timeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);
  
  const intervals = [
     { label: 'second', seconds: 60 },
    { label: 'minute', seconds: 3600 },
    { label: 'hour', seconds: 86400 },
    { label: 'day', seconds: 2592000 },
    { label: 'month', seconds: 31536000 },
    { label: 'year', seconds: Infinity }
  ];
  
  for (const { label, seconds: interval } of intervals) {
    if (seconds < interval) {
      const time = Math.floor(seconds / (interval / 60));
      const plural = time !== 1 ? `${label}s` : label;
      return time <= 1 ? `a ${plural} ago` : `${time} ${plural} ago`;
    }
  }
}



function removeSpecialCharacters(str) {
  return str.replace(/[^a-zA-Z0-9_]/g, '');
}

const createFavouriteIcon = (short_article) => {


  const favBtn = document.createElement('span');
  favBtn.classList.add(`srj_${short_article.id}`);
  if(!storedArticels.some(art => art.id === short_article.id)){
  favBtn.innerText = '♡'; 
  }else{
  favBtn.innerText = '♥'; 
  }
  favBtn.title = 'Mark as Favourite';
  favBtn.style.cursor = 'pointer';
  favBtn.style.fontSize = '24px';
  favBtn.style.marginLeft = '10px';
  favBtn.style.color = '#FFD700';


  favBtn.addEventListener('click', () => {

    console.log('short_article', short_article);

  if(storedArticels.length > 0 ){
 
    if(!storedArticels.some(art => art.id === short_article.id)){
     const merged = [...storedArticels,short_article];
      
      const sortedArtiles = merged.sort();
      localStorage.setItem(favKey, JSON.stringify(sortedArtiles));
      favBtn.innerText = '♥';
      storedArticels = sortedArtiles;
      console.log("New item", short_article);
    }else{
      const removed = storedArticels.filter(art => art.id.toString() !== short_article.id.toString());
  
      console.log('removed', removed);
      storedArticels = removed.sort();
      console.log('storedArticels', storedArticels);
     
      localStorage.setItem(favKey,JSON.stringify(storedArticels));
      favBtn.innerText = '♡';
    }

  }else{
    console.log('intial item', short_article);
    storedArticels.push(short_article);
    localStorage.setItem(favKey, JSON.stringify([short_article]));
    favBtn.innerText = '♥';
  }

  });

  return favBtn;
};

function removeFavRawPrefix(str) {
  const prefix = "fav_raw_";
  return str.startsWith(prefix) ? str.slice(prefix.length) : str;
}

const createToggleBtn = (block, short_article,isScrolled=false) => {
  const hideBtn = createButton('Less', () => {
    block.style.display = 'none';
    hideBtn.remove();
    block.parentNode.insertBefore(showBtn, block.nextSibling);
  });



  const showBtn = createButton('See More', () => {
    block.style.display = 'block';
    showBtn.remove();
    hideBtn.classList.add(`hidden_btn_${short_article.id}`);
    block.parentNode.insertBefore(hideBtn, block.nextSibling);
  });
  
  showBtn.classList.add(`show_btn_${short_article.id}`);

  const favIcon = createFavouriteIcon(short_article);

  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  if(!isScrolled){
    wrapper.appendChild(showBtn);
  }else{
    const getShowBtnElement = document.querySelector(`.show_btn_${short_article.id}`);

    getShowBtnElement?.remove();
    favIcon.remove();
    wrapper.appendChild(hideBtn);
  }
  wrapper.appendChild(favIcon);

  return {showBtn,wrapper};
}

const makeToggleCollapsToScroll = (assistantMessage,article) => {
  const {wrapper} = createToggleBtn(assistantMessage,article, true);
  assistantMessage.parentNode.insertBefore(wrapper, assistantMessage.nextSibling);
}

function autoCollapse() {
  try {
    const assistantMessages = Array.from(document.querySelectorAll('[data-message-author-role="assistant"]:not([data-processed])'));
    const userMessages = Array.from(document.querySelectorAll('.whitespace-pre-wrap:not([data-processed])'));

    const assistantToCollapse = assistantMessages.slice(0,-1);
    const userToCollapse = userMessages.slice(0,-1);


    console.log('called autoCollapse');
    const processAssistantBlock = (block,index) => {
    
    
      if (block.dataset.hidden) return;
      if(!block) return;


      block.dataset.processed = 'true';
      block.style.display = 'none';
      block.dataset.hidden = 'true';




      const child = block.querySelector('[data-start="0"]');

      const originalText = child.textContent.trim();
      const words = originalText.split(/\s+/);
      const preview = words.length > 5 ? words.slice(0, 5).join(' ') + '...' : originalText;
      function underscoreConcat(text) {
        return text.trim().split(/\s+/).join('_').toLowerCase();
      }
 
      const articleId = underscoreConcat(index+document.title);
      block.id = `srj_${removeSpecialCharacters(articleId)}`;

      console.log('url', url);
      let short_article = {
        id:removeSpecialCharacters(articleId),
        title:document.title,
        resPath:url,
        description:preview,
        savedDate: new Date(),
      }


      const {wrapper} = createToggleBtn(block,short_article);


      wrapper.id = 'toggle_btns';
      block.parentNode.insertBefore(wrapper, block);
    };

    const processUserBlock = (block, index) => {
   
      if (block.dataset.hidden) return;

      block.dataset.processed = 'true';
      const originalText = block.textContent.trim();
      const words = originalText.split(/\s+/);
      const preview = words.length > 5 ? words.slice(0, 5).join(' ') + '...' : originalText;

      block.style.display = 'none';
      block.dataset.hidden = 'true';

      const previewPara = document.createElement('p');
      previewPara.innerText = preview;
      previewPara.className = `short_res_${index}`;

      const showMoreBtn = createButton('More...', () => {
        block.style.display = 'block';
        previewPara.remove();
        showMoreBtn.remove();
        block.parentNode.insertBefore(showLessBtn, block.nextSibling);
      });

      const showLessBtn = createButton('Less', () => {
        block.style.display = 'none';
        showLessBtn.remove();
        block.parentNode.insertBefore(previewPara, block);
        block.parentNode.insertBefore(showMoreBtn, block.nextSibling);
      });

      block.parentNode.insertBefore(previewPara, block);
      block.parentNode.insertBefore(showMoreBtn, block.nextSibling);
    };
    

    assistantToCollapse.forEach(processAssistantBlock);
    userToCollapse.forEach(processUserBlock);
  } catch (error) {
    console.error('Auto-collapse failed:', error);
  }
}



const tableActions = () => {
  try {


    const fav_trs = Array.from(document.querySelectorAll('.fav_tr'));
    const modal = document.getElementById('modal_ex');


    const action = (tr,index) => {
         try {


          const artId = removeFavRawPrefix(tr.id);
    
          const article = findArticleById(storedArticels, artId);
    
          const delete_btn = tr.querySelector(`.delete-btn`);
      
          const tds = tr.querySelectorAll(`td#td_${artId}`);

    
    
          if(tds && tds.length > 0){
    
            const tdHandler = (td) => {
              td.addEventListener("click", () => {
                const artId = removeFavRawPrefix(tr.id);
                
                const favBtns = document.querySelectorAll(`.srj_${artId}`);
    
                favBtns?.forEach((favBtn) => favBtn.remove());
    
                const assistantMessage = document.getElementById(`srj_${artId}`);
           
                console.log('assistantMessage', assistantMessage)

                if(!assistantMessage){
  
                  console.log(article.resPath+`${'#'+artId}`);
                  window.open(article.resPath+`${'#'+artId}`, '_blank');

                }else{
                  const btnsWrapperElement = assistantMessage.nextElementSibling;
                  btnsWrapperElement?.remove();
                
               
         
                  if(url === article.resPath){
                      assistantMessage.style.display = 'block';
                     
                      // favBtn?.remove();
                      makeToggleCollapsToScroll(assistantMessage,article);
                    
                    
                    assistantMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }

 
                modal.classList.add('hidden_srj');
                modal.classList.remove("showmodal_srj");
              
              })
            }
            tds.forEach(tdHandler);
          }
          if(delete_btn){
              const articleId = delete_btn.dataset.userId;
    
    
              let favBtn = document.querySelector(`.srj_${articleId}`);
              const trElement = document.getElementById(`fav_raw_${articleId}`);
              
              // const tdElement = document.getElementById(`fav_raw_${articleId}`);
    
              const art_not_found = document.getElementById('art_not_found');
            
            
            
              delete_btn.addEventListener("click",()=>{
          
                if(storedArticels.length > 0 ){
          
                  if(storedArticels.some(art => art.id.toString() === articleId.toString())){
                    const removed = storedArticels.filter(art => art.id.toString() !== articleId.toString());
                
                    storedArticels = removed.sort((a, b) => a.id - b.id);
          
          
                    localStorage.setItem(favKey, JSON.stringify(storedArticels));
                
                    if(trElement){
                      trElement.remove();
                      if(storedArticels.length === 0){
                      const table = document.getElementById('article-table');
                      table.innerHTML = "";
                      art_not_found.innerText = "No responses found.";
                      art_not_found.classList.remove('hidden_not_found');
                      }
                    }
              
                    if(favBtn){
                      favBtn.innerText = '♡';
                    }
                  }
            
                }
              })
          }
          if(tr.length === index){
              return;
          }
         } catch (error) {
          console.log('error', error)
         }
    }


    fav_trs.forEach(action);

    } catch (error) {
      console.log('error', error);
    }
}


const findArticleById = (array, id) => {
 return array.find(item => item.id.toString() == id.toString()); 
}



function createFloatingButton() {


    if (document.getElementById('auto-collapse-btn')) return; // prevent duplicates

    const button = document.createElement('button');
    button.id = 'auto-collapse-btn'; // 👈 give it a stable ID
    button.classList.add('openModalBtn')
  
    button.innerText = '⚙️'; // Settings gear icon
  
    Object.assign(button.style, {
      position: 'fixed',
      bottom: '50%',
      right: '20px',
      zIndex: '9999',
      padding: '10px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border:'1px solid #ddd'
    });
  
    button.addEventListener('click', () => {
      autoCollapse();
    });
  

  

    document.body.appendChild(button);
  

}



function modalStyles(isDark){
  const style = document.createElement('style');
style.textContent = `

   #art_not_found{
      text-align: center;
      margin-top: 2rem;
    }
    .hidden_not_found{
     margin-top:0 !important;
    }
   #fav_articles{
    margin-top:1.5rem;
   }
  .hidden_srj {
    display: none !important;
  }

  .modal_srj {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${isDark ? "rgba(0,0,0,0.5":"rgba(0,0,0,0.5"});
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s forwards;
  }

  .modal-content {
    background: ${isDark ? "#303030":"white"};
    padding: 20px;
    border-radius: 10px;
    width: 90%;
    max-width: 1000px;
    transform: scale(0.8);
    opacity: 0;
    animation: popIn 0.3s forwards;
    position: relative;
    color: ${isDark ? "white":"black"};
  }

  .close {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 24px;
    cursor: pointer;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes popIn {
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

}

function injectTableStyles(isDark) {
  const style = document.createElement('style');
  style.textContent = `

    #article-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'Segoe UI', sans-serif;
      // background-color: ${isDark ? '#334155' : '#fff'};
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    #article-table th, #article-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid ${isDark ? '#475569' : '#eee'};
    }

    #article-table th {
      // background-color: ${isDark ? '#1e293b' : '#f9f9f9'};
      font-weight: 600;
    }

    #article-table tr:hover {
      background-color: ${isDark ? '#00000024' : '#f1f5f9'};
    }

    #pagination {
      margin-top: 12px;
      text-align: center;
    }

    #pagination button {
      margin: 0 4px;
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      background-color: ${isDark ? '#334155' : '#e2e8f0'};
      color: ${isDark ? '#f1f5f9' : '#1e293b'};
      cursor: pointer;
      transition: background-color 0.3s;
    }

    #pagination button:hover:not(:disabled) {
      background-color: ${isDark ? '#475569' : '#cbd5e1'};
    }

    #pagination button:disabled {
      background-color: ${isDark ? '#1e293b' : '#94a3b8'};
      color: white;
      cursor: not-allowed;
    }

    button.action-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      font-size: 14px;
      border-radius: 6px;
      color: inherit;
      transition: background-color 0.2s;
    }

    button.action-btn:hover {
      background-color: ${isDark ? '#475569' : '#e2e8f0'};
    }

    button.delete-btn {
      color: #ef4444;
    }

    button.pin-btn {
      color: #3b82f6;
    }
  `;
  document.head.appendChild(style);
}


function detectTheme() {
  const themeMode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const isDark = themeMode === "dark";
  modalStyles(isDark);
  injectTableStyles(isDark);

  const btn = document.getElementById('auto-collapse-btn');
  if (btn) {
    btn.style.backgroundColor = isDark ? "#000" : "#fff";
    btn.style.color = isDark ? "#fff" : "#000";
  } else {
    console.warn("Element with ID 'auto-collapse-btn' not found.");
  }
}


function modal() {
  const modalHTML = `
  <div id="modal_ex" class="modal_srj hidden_srj">
    <div class="modal-content">
      <span id="closeModalBtn" class="close">&times;</span>
      <h2>Favorite Responses</h2>
      <div id="art_not_found"></div>
      <div id="fav_articles">
        <table id="article-table"></table>
        <div id="pagination"></div>
      </div>
    </div>
  </div>
`;


  const body = document.body; // ✅ Get the actual body element directly
  body.insertAdjacentHTML('beforeend', modalHTML); // ✅ Append the modal HTML
}



// const articles = JSON.parse(localStorage.getItem(favKey) || '[]');

const rowsPerPage = 8;
let currentPage = 1;

function renderTablePage(page) {
  const table = document.getElementById('article-table');
  const art_not_found = document.getElementById('art_not_found');
    
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageItems = storedArticels.slice(start, end).sort((a, b) => {
    return new Date(a.savedDate) < new Date(b.savedDate) ? 1 : a.savedDate > b.savedDate ? -1 : 0;
  });

  if(storedArticels && storedArticels.length > 0){
    art_not_found.innerText = "";
    art_not_found.classList.add('hidden_not_found');
      // Table Header
  table.innerHTML = `
  <thead>
    <tr>
      <th>ID</th>
      <th>Title</th>
      <th>Description</th>
      <th>Saved Date</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    ${pageItems
      .map(
        (a,index) => `
      <tr id=fav_raw_${a.id} class="fav_tr">
        <td>${index+1}</td>
        <td id=td_${a.id}>${a.title}</td>
        <td id=td_${a.id}>${a.description}</td>
        <td>${timeAgo(new Date(a.savedDate))}</td>
        <td>
          <button data-user-id=${a.id} class="action-btn delete-btn" title="Delete">
            🗑️
          </button>
         
          
        </td>
      </tr>`
      )
      .join('')}
  </tbody>
`;
  }else{
    art_not_found.innerText = "No responses found.";

  }
  tableActions();
  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(storedArticels.length / rowsPerPage);
  const pagination = document.getElementById('pagination');

  pagination.innerHTML = '';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Previous';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => changePage(currentPage - 1);
  pagination.appendChild(prevBtn);

  const pageIndicator = document.createElement('span');
  pageIndicator.style.margin = '0 8px';
  pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
  pagination.appendChild(pageIndicator);

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => changePage(currentPage + 1);
  pagination.appendChild(nextBtn);
}

function changePage(page) {
  currentPage = page;
  renderTablePage(currentPage);
}



function openModal() {

  console.log('openModal');
  const modalEl = document.getElementById('modal_ex');
  const openBtn = document.querySelector('.openModalBtn');
  const closeBtn = document.getElementById('closeModalBtn');



  if (openBtn) {
    openBtn.addEventListener('click', () => {
      console.log('clicked on opne modal button');
      console.log('modal', modalEl);
    if (modalEl) {
      modalEl.classList.remove('hidden_srj');
      modalEl.classList.add("showmodal_srj");
    }
    // Initial render
    renderTablePage(currentPage);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      // alert('Hi');
      if(modalEl){
        modalEl.classList.add('hidden_srj');
        modalEl.classList.remove("showmodal_srj");
      }

    });
  }

  window.addEventListener('click', (e) => {
    if(modalEl){
      if (e.target === modalEl) {
        modalEl.classList.add('hidden_srj');
        modalEl.classList.remove("showmodal_srj");
      }
    }

  });


}


function scrollInSection(){
 try {
  let hasPath = window.location.hash ;
  let articleId;
  if (hasPath) {
    articleId = hasPath.startsWith('#') ? hasPath.slice(1) : str;
  }

  console.log('articleId at 717', articleId);
  if(articleId){
    const article = findArticleById(storedArticels,articleId);
  
    const assistantMessage = document.getElementById(`srj_${articleId}`);



    if(assistantMessage && article){
      assistantMessage.style.display = 'block';
      assistantMessage.style.padding = "4px";
      assistantMessage.style.backgroundColor = "#dfe80112";
      const favBtns = document.querySelectorAll(`.srj_${articleId}`);
    
      favBtns?.forEach((favBtn) => favBtn.remove());
      makeToggleCollapsToScroll(assistantMessage,article);
      assistantMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  }
 } catch (error) {
  console.log('error', error);
 }

}





window.addEventListener('load', () => {
 
  // --- initial setup ---
  createFloatingButton();
  setTimeout(() => {
    autoCollapse();
  },2000);
  if (!document.getElementById('modal_ex')) {
    modal(); // this should create #modal_ex
   console.log('modal creating...');

    // openModal();
    console.log('called openModal()');
  }
  // Optional delay for scroll
  setTimeout(scrollInSection, 2500);

  const assistantMessageObserver = new MutationObserver((mutationsList) => {

    console.log('mutationsList', mutationsList);
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes') {
        const oldValue = mutation.oldValue;
        const newValue = mutation.target.getAttribute(mutation.attributeName);
        if (oldValue === newValue) {
          console.log('Attribute change reverted or remained the same.');
        } else {
          console.log(`Attribute "${mutation.attributeName}" changed from "${oldValue}" to "${newValue}"`);
        }
      } else if (mutation.type === 'characterData') {
        const oldText = mutation.oldValue;
        const newText = mutation.target.data;
        if (oldText === newText) {
          console.log('Text change reverted or remained the same.');
        } else {
          console.log(`Text changed from "${oldText}" to "${newText}"`);
        }
      }
    }

    console.log('assistantMessage Observer');
    // autoCollapse();
   

  
    // recreate floating button if missing
    // if (!document.getElementById('auto-collapse-btn')) {
    //   createFloatingButton();
    //   console.log('createFloatingButton creating...');
     
    // }


    // ensure modal exists before observing it
    // if (!document.getElementById('modal_ex')) {
    //   modal(); // This should create #modal_ex
    //   console.log('modal creating...');
    // }
  });

  

  // setTimeout(()=>{
    const elements = document.querySelectorAll('[data-message-author-role="assistant"]');
    if(elements){
      elements.forEach(el => {
        console.log('el', el);
        assistantMessageObserver.observe(el, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true
        });
      });
    }
  // },4000)

const htmlEl = document.documentElement; // This is the <html> element

const observerHtmlEl = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'attributes') {
      console.log(`Attribute "${mutation.attributeName}" changed`);
      console.log('Old value:', mutation.oldValue);
      console.log('New value:', htmlEl.getAttribute(mutation.attributeName));

      if('style' === mutation.attributeName){
        detectTheme();
      }


      // console.log('New value:', htmlEl.getAttribute(mutation.attributeName));
    }
  }
});

observerHtmlEl.observe(htmlEl, {
  attributes: true,
  attributeOldValue: true,
  childList: false, // ✅ Don't observe child nodes
  subtree: false    // ✅ Don't go into children
});



  const observePageTitle = new MutationObserver(()=>{
   
    if (document.title !== previousTitle) {
      url = window.location.href;

      autoCollapse();
      openModal();
      detectTheme();

      previousTitle = document.title;
    }
  });
  observePageTitle.observe(document.querySelector('title'),{
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  })

  const floatingButtonObserver = new MutationObserver(()=> {
    console.log('floatingButtonObserver mutation');
  }); 

  floatingButtonObserver.observe(document.getElementById("auto-collapse-btn"),{
    childList: true,
    subtree: true
  });



  const observerBody = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // Check added elements
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 &&  node.nodeName === "ARTICLE") { // Ensure it's an element
          autoCollapse();
        }
      });
  
      // Check removed elements
      // mutation.removedNodes.forEach((node) => {
      //   if (node.nodeType === 1) {
      //     console.log('Element removed:', node);
      //   }
      // });
    }
  });
  
  observerBody.observe(document.body, {
    childList: true,     // ✅ Watch for direct children added/removed
    subtree: true        // ✅ Watch *all* descendants, not just direct children
  });
  



  // bodyObserver.observe(document.body, {
  //   // childList: true,
  //   // // subtree: true
  //   // // attributes: true
  //   // characterData: true
  //   childList: true,
  //   subtree: true,
  //   attributes: true,
  //   characterData: true,
  //   attributeOldValue: true,
  //   characterDataOldValue: true
  // });


  // const modalObserver = new MutationObserver(() => {
  //   console.log('modalObserver mutation');
  // });

  // // Wait for modal_ex to exist, then start observing it
  // function waitAndObserveModal() {
  //   const checkExist = setInterval(() => {
  //     const modalEl = document.getElementById('modal_ex');
  //     if (modalEl) {
  //       clearInterval(checkExist);
  //       modalObserver.observe(modalEl, {
  //         childList: true,
  //         subtree: true
  //       });
  //     }
  //   }, 100);
  // }

  // // If modal already exists, observe it immediately
  // if (document.getElementById('modal_ex')) {
  //   modalObserver.observe(document.getElementById('modal_ex'), {
  //     childList: true,
  //     subtree: true
  //   });
  // } else {
  //   waitAndObserveModal();
  // }
});
