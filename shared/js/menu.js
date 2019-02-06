"use strict"


;(function loaded(global){


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }

  if (!(jazyx.classes)) {
    jazyx.classes = {}
  }
 

  const STORAGE_NAME = "jazyx_menu"
  
  function log () {
    console.log(...arguments)
  }


  class Menu {
    constructor () { 
      this.injectHTML() // sets this.menu

      // this.level = 1
      // this.levelInstance = null // will be instance of level class
      // this.levelTarget = null   // will be button touched on menu
      // this.menu = document.querySelector( 'nav section' )
     
      this.check = document.querySelector( 'input[type=checkbox]' )
      this.links = [].slice.call(document.querySelectorAll("nav a"))
      // this.localData = this.readLocalData()

      // Mouse events
      {
        let touchLink = this.touchLink.bind(this)
        this.menu.addEventListener("mousedown", touchLink, false)

        // Don't let movable label appear when user drags on link
        this.menu.ondragstart = function() { return false; }

        let closeMenu = this.closeMenu.bind(this)
        document.body.addEventListener("mousedown", closeMenu, false)
      }
    }


    // PRIVATE METHODS


    // Called automatically immediately after constructor()
    initialize() {
      // let level = parseInt(window.location.hash.substring(1), 10) || 0
      // let force = /[?&]force$/.test(window.location.href)
      // let bestLevel = this.bestLevel()

      // if (force) {
      //   if (level > 0) {
      //     if (this.localData.levelsPlayed.indexOf(level) < 0) {
      //       this.level = level
      //       this.unlockLevel(level)
      //       this.showActiveLink(level)
      //     }
      //   }

      // } else {
      //   level = Math.min(level, bestLevel)
      // }

      // if (level) {
      //   this.setLevel(level, { dontStart: true })
      // } else {
      //   this.showActiveLink(0)
      // }
    }


    injectHTML() {
      this.addNav()
      this.addClass()
    }


    addNav() {
      let sections = [].slice.call(document.querySelectorAll("section"))
     
      let body = document.body
      let nav = document.createElement("nav")
      let checkbox = document.createElement("input")
      let label = document.createElement("label")
      let section = document.createElement("section")
      let ul = document.createElement("ul")
      let svg = `
        <svg version="1.1"
         xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink"
         width="44.775px"
         height="44.775px" 
         viewBox="0 0 44.775 44.775"
         >
          <g>
            <g>
              <path d="
                M39.777,2.388
                H5
                c-2.761, 0-5, 2.238-5, 5
                s2.239, 5, 5, 5
                h34.775
                c2.762, 0, 5-2.238, 5-5
                S42.538,2.388,39.777,2.388
                z"/>
              <path d="
                M27.777,17.388
                H5
                c-2.761,0-5,2.238-5,5
                c0,2.762,2.239,5,5,5
                h22.775
                c2.762,0,5-2.238,5-5
                C32.775,19.625,30.538,17.388,27.777,17.388
                z"/>
              <path d="
                M14.777,32.388
                H5
                c-2.761,0-5,2.238-5,5
                s2.239,5,5,5
                h9.776
                c2.761,0,5-2.238,5-5S17.538,32.388,14.777,32.388
                z"/>
            </g>
          </g>
        </svg>`

      checkbox.type = "checkbox"
      checkbox.id = "menu"

      label.htmlFor = checkbox.id
      label.innerHTML = svg

      nav.appendChild(section)
      section.appendChild(checkbox)
      section.appendChild(label)
      section.appendChild(ul)

      sections.forEach((section) => {
        let id = section.id
        let name = section.dataset.name

        if (id && name) {
          let li = document.createElement("li")
          let a = document.createElement("a")
          li.appendChild(a)
          a.href = "#" + id
          a.innerText = name

          ul.appendChild(li)
        }
      })
      
      body.insertBefore(nav, body.childNodes[0]) 
      this.menu = section
    }


    addClass() {
      let link = document.createElement("link")
      link.href = "../shared/css/menu.css"
      link.type = "text/css"
      link.rel = "stylesheet"
      document.getElementsByTagName("head")[0].appendChild(link)
    }

    /**
     * Sent by setLevel if dontStart is true. Highlights the
     * current link in the menu and slides the menu open.
     *
     * @param      {<type>}  level    The level
     * @param      {<type>}  options  The options
     */
    openMenu(linkIndex, options) {
      this.showActiveLink(linkIndex, options)
      this.check.checked = true
    }


    // Called by mousedown|touchstart anywhere but on the menu
    closeMenu(event) {
      let target = event.target

      if (this.check.checked) {
        while (target && target.nodeName !== "NAV") {
          target = target.parentNode
        }

        if (!target) {
          // The user tapped outside the open menu. Close it.
          this.check.checked = false
        }
      }
    }


    // Called by mousedown|touchstart on the menu
    touchLink(event) {
      let target = event.target

      while (target && target.nodeName !== "A") {
        target = target.parentNode
      }

      if (!target) {
        return
      }

      this.startScroll = this.getSectionScrollTop(target)

      this.levelTarget = target
      let selectLevel = this.selectLevel.bind(this)

      // document.body.onmouseup = document.body.ontouchend = selectLevel
      document.body.onmouseup = selectLevel
    }


    getSectionScrollTop(target) {
      while (target && target.nodeName !== "SECTION") {
        target = target.parentNode
      }

      let scrollTop = target ? target.scrollTop : 0

      return scrollTop
    }


    // Called by a mouseup|touchend, as set in touchLink
    selectLevel(event) {
      let scrollTop = this.getSectionScrollTop(this.levelTarget)

      if (Math.abs(scrollTop - this.scrollTop) > 10 ) {
        // The user dragged the menu. Don't make any selection yet
        return
      } else if (event.target !== this.levelTarget) {
        // The user dragged along the menu to a different button
        return // Leave the menu open
      }

      let level = this.levelTarget.innerHTML
      let success

      if (this.levelTarget.parentNode.classList.contains("ref")) {
        success = this.showReference(this.levelTarget)
      } else {
        success = this.setLevel(level)
      }

      if (success) {
        // Close the menu
        this.levelTarget = 0
        document.body.onmouseup = document.body.ontouchend = null
        this.check.checked = false
      }
    }

    /**
     * Called by initialize, selectLevel, displayRef and the playLevel
     * method of the Pass instance.
     *
     * When called by initialize() on launch, dontStart will be true.
     * This simply opens the menu at the chosen level, so that the
     * end user can tap and thus activate audio.
     * 
     * TODO: On a non-touch-screen device, there is no need for an
     * extra click. We should detect the type of device and ignore
     * `dontStart` if it's not needed.
     *
     * @param      {integer}  level     The level
     * @param      {options}  { dontStart:        <true on launch>
     *                        , dontScrollPage:   <true if same level>
     *                        , scrollToPrevious: <true if next level>
     *                        , unlockNext:       <true if same level>
     *                        }
     * @return     {boolean}   { description_of_the_return_value }
     */
    setLevel(level, options = {}) {
      log("Level", level, "selected")

      let levelOptions = monika.levelOptions[level]
      var intLevel = parseInt(level, 10) || false

      if (levelOptions) {
        let levelInstance = this.getLevel(levelOptions)

        if (levelInstance) {
          if (this.levelInstance) {
            this.levelInstance.cleanUp()
          }

          if (intLevel) {
            this.level = intLevel
          }
          
          if (options.dontStart) {
            this.openMenu(intLevel, options)

          } else {
            this.levelInstance = levelInstance.initialize(levelOptions)

            this.unlockLevel(intLevel)
            this.showActiveLink(intLevel, options)
            monika.customKeyboard.close()
            monika.timer.stop("reset")

            // hash will already have been set if the call came from
            // initialize or a click on the menu. It really only needs
            // to be set if the call came from the Continue button in
            // the Pass instance. But hey!
            window.location.hash = intLevel

            if (!options.dontScrollPage) {
              window.scrollTo(0, 1)
            }
          }

          return true
        }
      }

      log("No level options found for level", level)
      return false
    }


    // Called by selectLevel when user selects АБВ or 123 pre-levels
    showReference(link) {
      let hash = decodeURIComponent(link.hash)
      return this.displayRef(hash)
    }


    // Called by setLevel
    getLevel(options) {
      let className = options.className
      let levelName = options.name || className

      let level = monika.levels[levelName]

      if (!level) {
        let levelClass = monika.classes[className]

        if (levelClass) {
          level = new levelClass(options)
          monika.levels[levelName] = level

        } else {
          log("Unknown level:", className)
        }
      }

      return level 
    }


    /**
     * Called by initialize, displayLevel and setLevel
     * 
     * @param {integer | undefined} level  Level to highlight and
     *                                     scroll to
     * @param {undefined | 0 | 1}   scrollToPrevious  if 1, then
     *                                     scroll the the button for
     *                                     the previous level into
     *                                     view
     */
    showActiveLink(linkIndex, options = {}) {
      let list             = document.querySelectorAll("nav li")
      let scrollToPrevious = options.scrollToPrevious
      let bestLevel        = this.bestLevel()

      if (isNaN(scrollToPrevious)) {
        scrollToPrevious = false
      } else if (scrollToPrevious !== false) {
        scrollToPrevious = linkIndex - 1 // a number from 0 up
      }

      // Note special treatment below to deal with this particularity:
      // * Numbering for li elements starts at 0
      // * Numbering for levels starts at 1
      
      var total = list.length       
      for ( let ii = 0; ii < total; /* see below */ ) {
        // Increment ii after getting the list item
        let li = list[ii++]
        // ii is now equal to the level for the li element

        if (ii === linkIndex) {
          li.classList.add("active")

          if (scrollToPrevious === false) {
            li.scrollIntoView()
          }

        } else {
          li.classList.remove("active")

          if (scrollToPrevious === ii) {
            li.scrollIntoView() 
          }
        }

        // LOCKS
        if (ii > bestLevel) {
          li.setAttribute("disabled", "")
        } else {
          li.removeAttribute("disabled")
        }
      }

      this.setRefDisplay()
    }


    // Called by constructor, initialize and setLevel
    readLocalData() {
      let localData

      try {
        localData = JSON.parse(localStorage[STORAGE_NAME])
      } catch(error) {}

      if (!localData) {
        localData = {}
      }

      // ALTERNATIVE IMAGES
      let user_images = localData.user_images
      if (!user_images) {
        user_images = {}
        localData.user_images = user_images
      }

      // LEVELS PLAYED
      let levelsPlayed = localData.levelsPlayed
      if (!levelsPlayed) {
        levelsPlayed = []
        localData.levelsPlayed = levelsPlayed
      }

      // TIMING DATA
      let levelTimes = localData.levelTimes
      if (!levelTimes) {
        levelTimes = {}
        localData.levelTimes = levelTimes
      }

      // CHALLENGE
      let challenges = localData.challenges
      if (!challenges) {
        challenges = {}
        localData.challenges = challenges
      }

      return localData
    }


    unlockLevel(level) {
      let levelsPlayed = this.localData.levelsPlayed

      if (level && (levelsPlayed.indexOf(level) < 0)) {
        levelsPlayed.push(level)
        localStorage[STORAGE_NAME] = JSON.stringify(this.localData)
      }
    }


    // Called by initialize and showActiveLink
    bestLevel() {
      let unlocked = this.localData.levelsPlayed
      let bestLevel = Math.max.apply(null, unlocked)

      return Math.max(bestLevel, 2)
    }


    // PUBLIC METHODS

    /**
     * Called by initialize, selectLevel, displayRef and the playLevel
     * method of the Pass instance.
     *
     * @param {integer} deltaLevel will be 1 if the user clicked on
     *                             Continue, 0 if s/he clicked on
     *                             Repeat This Level
     */
    completeLevel(deltaLevel) {
      let options = { 
        scrollToPrevious: !!deltaLevel // true if going up a level
      , dontScrollPage: !deltaLevel // true if staying at the same level
      }

      if (!deltaLevel) {
        // Ensure that the next level is unlocked anyway
        this.unlockLevel(this.level + 1)
      }

      this.setLevel(this.level + deltaLevel, options)
    }


    // Called by selectImageForWord in game.js
    setUserImageForWord(word, src) {
      let user_images = this.localData.user_images

      if (!user_images) {
        user_images = {}
        this.localData.user_images = user_images
      }

      user_images[word] = src
      localStorage[STORAGE_NAME] = JSON.stringify(this.localData)
    }


    // Called by selectImageForWord in game.js
    getUserImageForWord(word) {
      let user_images = this.localData.user_images
      let src = user_images[word]

      return src
    }


    // Called by showReference and also by toggleType in layout/reference.js
    displayRef(hash, dontScrollPage) {
      this.showActiveLink(0) // doesn't change this.level

      this.setLevel(hash.substring(1), { dontScroll: dontScrollPage })
      this.setRefDisplay(hash)

      return true
    }


    setRefDisplay(hash) {
      let refLinks = document.querySelectorAll("nav div.ref a")

      var total = refLinks.length       
      for (let ii = 0; ii < total; ii += 1) {
        let refLink = refLinks[ii]
        if (refLink.hash === hash) {
          refLink.classList.add("active")
        } else {
          refLink.classList.remove("active")
        }
      } 
    }


    getLevelTimes(levelName) {
      let levelTimes = this.localData.levelTimes[levelName]
      return Object.assign({}, levelTimes)
    }


    setLevelTimes(levelName, levelTimes) {
      this.localData.levelTimes[levelName] = levelTimes
      localStorage[STORAGE_NAME] = JSON.stringify(this.localData)
    }


    getChallenges(challengeFolder, dontClone) {
      let challengeData = this.localData.challenges[challengeFolder]

      if (!challengeData) {
        challengeData = []
        this.localData.challenges[challengeFolder] = challengeData
      }

      if (!dontClone) {
        challengeData = challengeData.slice(0)
      }

      console.log(challengeData)

      return challengeData
    }


    updateChallenge(challengeFolder, challengeName) {
      let challengeData = this.getChallenges(challengeFolder, true)

      // Esure that challengeName is at the end
      let index = challengeData.indexOf(challengeName)
      if (index < 0) {

      } else {
        challengeData.splice(index, 1)
      }

      challengeData.push(challengeName)

      localStorage[STORAGE_NAME] = JSON.stringify(this.localData)
    }
  }


  jazyx.menu = new Menu()
  jazyx.menu.initialize()

})(window)