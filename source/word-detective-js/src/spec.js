import { main } from "./main.js";

let control;
let messages;
main(true).then( (control_handler) => {
  control = control_handler;
  fetch("js/modules/word-detective/assets/english_messages.json")
  .then( (response) => response.json() )
  .then( (json) => {
    messages = json;
    load_spec();
    mocha.run();
  });
});

function load_spec() {

  describe('gui_WORD_DETECTIVE_api', function () {
    const ontheroad = "On the road";
    let gui = control.ephemeral.gui_WORD_DETECTIVE_api();

    it('updates the word display', function () {
      gui.set_display_value(ontheroad);
      expect(gui.get_display_value()).equal(ontheroad);

      gui.clear_display_value();
      expect(gui.get_display_value()).equal('');
    });

    it('updates the status display', function () {
      gui.set_status_value(ontheroad);
      expect(gui.get_status_value()).equal(ontheroad);

      gui.clear_status_value();
      expect(gui.get_status_value()).equal('');
    });

    it('updates the missing words display', function () {
      gui.set_missing_words_value(ontheroad);
      expect(gui.get_missing_words_value()).equal(ontheroad);

      gui.clear_missing_words_value();
      expect(gui.get_status_value()).equal('');
    });


  });

  describe('WORD_DETECTIVE_api', function () {
    let gui = control.ephemeral.gui_WORD_DETECTIVE_api();

    it('updates the word display with the clicked letter', function () {
      gui.clear_display_value();

      control.click_letter('j');
      control.click_letter('a');
      control.click_letter('c');
      control.click_letter('k');

      expect(gui.get_display_value()).equal('jack');
    });

    it('updates the word display when erase button is clicked', function () {
      gui.set_display_value("kerouac");

      control.erase_letter();
      control.erase_letter();
      control.erase_letter();

      expect(gui.get_display_value()).equal('kero');
    });

    it('it enters hint mode correctly', function () {
      control.hint();

      //I have '_' at even positions
      let i = 1;
      for (let c of gui.get_display_value()) {
        if (i % 2 === 0) {
          expect(c).equal('_');
        }
        i++;
      }
    });

    it('it updates word display correctly in hint mode when triggering click_letter', function () {
      let initial_hint_display = gui.get_display_value();
      let j = 0;
      for (let c of initial_hint_display) {
        if (c === '_'){
          j++;
        }
      }

      //After j click_letter, all '_' are gone
      for (let k = 0; k < j; ++k) {
        control.click_letter('a');
      }

      for (let c of gui.get_display_value()) {
        expect(c).not.equal('_');
      }
    });

    it('it clears the word display when hint is pressed a second time', function () {
      control.hint();
      expect(gui.get_display_value()).equal('');
    });

    it('it updates word display correctly in hint mode when triggering erase_letter', function () {
      control.hint();
      let initial_hint_display = gui.get_display_value();

      control.click_letter('k');
      control.click_letter('k');

      //After j erase_letter, we've got the initial hint display
      for (let k = 0; k < 2; ++k) {
        control.erase_letter();
      }
      expect(gui.get_display_value()).equal(initial_hint_display);

    });

    it('it displays a too short word message',function(){
      gui.set_display_value('too');
      control.check_word();
      expect(gui.get_status_value()).equal(messages.word_too_short_message);
    });

  });

}