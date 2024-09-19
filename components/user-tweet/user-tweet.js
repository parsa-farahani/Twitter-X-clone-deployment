class UserTweet extends HTMLElement {
   constructor() {
      super();
   }

   async render() {
      const { sr } = this;

      sr.querySelector('.post-ctx__author-img-bar__img-cont__img').src = this.dataset.authorAvatar || "";
      sr.querySelector('.post-ctx__content-bar__header__author-link__avatar-cont__img').src = this.dataset.authorAvatar || "";
      sr.querySelector('.post-ctx__content-bar__header__username__text').innerText = this.dataset.authorUsername || "";
      sr.querySelector('.post-ctx__content-bar__header__id__text').innerText = this.dataset.authorId || "";
      const datetime = new Date(this.dataset.datetime);
      sr.querySelector('.post-ctx__content-bar__header__time').setAttribute('datetime',datetime) || "";
      sr.querySelector('.post-ctx__content-bar__header__time').innerText = formatTime( (this.dataset.datetime) ? Date.now() - datetime.getTime() : 0 ) || "";
      sr.querySelector('.post-ctx__content__text__text').innerText = this.dataset.content || "placeholder text";
      
      const mediaSrcs = (this.dataset.mediaSrcs) ? JSON.parse(this.dataset.mediaSrcs) : [];

      if (mediaSrcs.length > 0) {
         const mediaCont = sr.querySelector('.post-ctx__content__media');
         this.classList.add('has-media');
         const division = (mediaSrcs.length >= 4) ? 4 : mediaSrcs.length;
         this.classList.add(`m-${division}`);

         mediaSrcs.forEach(ms => {
            const mediaInner = document.createElement('div');
            mediaInner.classList.add('post-ctx__content__media__inner');
            if (ms.kind === 'img') {
               const imgEl = document.createElement('img');
               imgEl.src = ms.src;
               imgEl.alt = 'post image';
               mediaInner.append(imgEl);
            }
            if (ms.kind === 'video') {
               const videoEl = document.createElement('video');
               videoEl.src = ms.src;
               videoEl.setAttribute('controls', '');
               videoEl.alt = 'post video';
               mediaInner.append(videoEl);
            }
            mediaCont.append(mediaInner);
         })

      }

      sr.querySelector('.post-ctx__date-view-cont__datetime').innerText = new Date(this.dataset.datetime).toLocaleString() || "";
      sr.querySelector('.post-ctx__date-view-cont__view__num').innerText = this.dataset.viewCount || 0;

      sr.querySelector('.post-ctx__info__btn__count__text--comments').innerText = this.dataset.commentsCount || 0;
      sr.querySelector('.post-ctx__info__btn__count__text--reposts').innerText = this.dataset.repostsCount || 0;
      sr.querySelector('.post-ctx__info__btn__count__text--likes').innerText = this.dataset.likesCount || 0;
      sr.querySelector('.post-ctx__info__btn__count__text--view').innerText = this.dataset.viewCount || 0;

      function formatTime(timeMs) {
         const timeSc = timeMs / 1000;
         if (timeSc <= 0) {
            return '0s';
         }

         if (timeSc < 60) {
            return `${Math.floor(timeSc)}s`
         }
         if (timeSc < 3600) {
            return `${Math.floor(timeSc / 60)}m`;
         }
         if (timeSc < (3600 * 24)) {
            return `${Math.floor(timeSc / 3600)}h`;
         }
         if (timeSc < (3600 * 24 * 30)) {
            return `${Math.floor(timeSc / (3600 * 24))}d`;
         }
         if (timeSc < (3600 * 24 * 365)) {
            return `${Math.floor(timeSc / (3600 * 24 * 30))}mo`;
         }
         return `${Math.floor(timeSc / (3600 * 24 * 365))}y`;
      }
   }

   async connectedCallback() {
      await fetch('./components/user-tweet/user-tweet.html')
      .then(res => res.text())
      .then(template => {
         this.sr = this.attachShadow({mode: 'open'});
         const DOMFragment = document.createElement('div');
         DOMFragment.innerHTML = template;
         template = DOMFragment.querySelector('template');
         this.shadowRoot.append(template.content.cloneNode(true));
         this.render();
      })
      ;

      /* Events */
      /* post page navigation */
      this.addEventListener('click', function(e) {
         if (!e.target === this) return;
         this.dispatchEvent(new CustomEvent('navigate-to-post', { bubbles: true, composed: true, cancelable: true, detail: {postId: +this.dataset.postId} }))
      })

      /* prevent default to avoid page-reload */
      this.shadowRoot.querySelectorAll('a').forEach(a => {
         a.onclick = () => false;
      })

      this.shadowRoot.addEventListener('click', e => {
         /* author-page link */
         if (e.target.closest('a[href="/user-panel"]')) {
            e.preventDefault();
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent('navigate-to-user-panel', { bubbles: true, composed: true, cancelable: true, detail: {id: this.dataset.authorId} }))
            return;
         }
         if (e.target.closest('button[data-delete]')) {
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent('delete-post', { bubbles: true, composed: true, cancelable: true, detail: {postId: +this.dataset.postId} }))
            return;
         }
         /*  media-click handler */
         if (e.target.closest('img')) {
            const elem = e.target.closest('img');
            e.stopPropagation();
            return;
         }
         /* activable button/icons */
         if (e.target.closest('[data-activable]')) {
            const elem = e.target.closest('[data-activable]');
            elem.classList.toggle('active');
            e.stopPropagation();
            return;
         }
      });

   }

   disconnectedCallback() {

   }

   static get observedAttributes() {
      return [ 'data-author-avatar', 'data-author-username', 'data-author-id', 'data-referred-id', 'data-datetime', 'data-content', 'data-media-srcs', 'data-comments-count', 'data-reposts-count', 'data-likes-count', 'data-view-count' ];
   }

   attributeChangedCallback(name, oldVal, newVal) {
      // this.render();
   }
}

customElements.define('user-tweet', UserTweet);